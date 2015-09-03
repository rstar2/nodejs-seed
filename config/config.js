var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var extend = require('node.extend');

var config = {
  // common configuration for all the environments, of course any property could be overwritten
  common: {
    root: rootPath,
    app: {
      name: 'nodejs-site-skeleton'
    },
    port: 3000
  },

  // development configuration
  development: {
    db: 'mongodb://localhost/nodejs-site-skeleton-dev',
    facebook: {
      enabled: true,
      appKey: 131313,
      appSecret: 1231213,
      scope: 'email',
      callbackURL : 'http://www.example.com/auth/facebook/callback'
    }
  },

  // test configuration
  test: {
    db: 'mongodb://localhost/nodejs-site-skeleton-test'
  },

  // production configuration
  production: {
    db: 'mongodb://localhost/nodejs-site-skeleton-prod'
  }
};

module.exports = extend(true, {}, config.common, config[env]);
