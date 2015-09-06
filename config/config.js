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
      appKey: '428723043979041',
      appSecret: 'f5a21426725e402194def7a1e0043f36',
      scope: ['email'],
      callbackURL : 'http://localhost:3000/auth/facebook/callback'
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
