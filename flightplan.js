var plan = require('flightplan');

var appName = 'node-app';

var ipStaging = '104.131.93.214';
var ipProduction = '188.166.102.235';
var username = 'rstar';
var startFile = 'bin/app.js';

var tmpDir = appName+'-' + new Date().getTime();

// configuration
plan.target('staging', [{
    host: ipStaging,
    username: username,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

plan.target('production', [{
    host: ipProduction,
    username: username,
    agent: process.env.SSH_AUTH_SOCK
  },
//add in another server if you have more than one
// {
//   host: '104.131.93.216',
//   username: username,
//   agent: process.env.SSH_AUTH_SOCK
// }
]);

// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');
  // local.exec('grunt build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');	
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  // 1. using forever module
  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  remote.exec('forever start ~/'+appName+'/'+startFile);
  
  // 2. using a native service - but 2 thing have to be done first to make this :
  // 2.1. A configuration file 'node-app.conf' must be added in the '/etc/init' directory
  //		start on filesystem and started networking
  //		respawn
  //		chdir /home/deploy/node-app
  //		env NODE_ENV=production #change this to staging if this is a staging server
  //		exec /usr/local/bin/node bin/app.js
  // 2.2 also the deplaying user 'username' should have bben given passwordless sudo access with
  //   		echo "deploy ALL=(root) NOPASSWD: /sbin/restart node-app" >> /etc/sudoers
  // remote.exec('sudo restart node-app');
});


// RUN it with
// $ fly production 