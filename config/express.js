var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');

var mongoose = require('mongoose');

var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  //---------------------------

  // uncomment after placing your favicon in /public
  // the favicon is cached in memory - not read each time from the file
  //app.use(favicon(config.root + '/public/favicon.ico'));

  // a simple logger middleware
  app.use(logger('dev'));

  // use the static middleware here before all the rest
  app.use(express.static(config.root + '/public'));

  // body-parsing middlewares
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // other useful middlewares
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  //---------------------------

  // add a session middleware and store the sessions in MongoDB

  // 1. First create the MongoDB connector
  var mongoStoreSession = new MongoDBStore({
    uri: config.db,
    collection: 'sessions'
  }, function(error) {
    // Should have gotten an error
  });

  // 2. Create the session middleware
  app.use(session({
    // the cookie name and properties
    name: 'app.sess',
    secret: 'SEKR37',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },

    // Force a cookie to be set on every response. This resets the expiration date.
    rolling: false,
    // Forces the session to be saved back to the session store, even if the session was never modified during the request
    resave: false,
    // Forces a session that is "uninitialized" to be saved to the store.
    // Choosing false is useful for implementing login sessions
    saveUninitialized: false,

    // use MongoDB
    store: mongoStoreSession
  }));

  //---------------------------

  require('./passport')(app, config);

  //---------------------------

  // all other custom routes
  var routes = glob.sync(config.root + '/app/routes/*.js');
  routes.forEach(function (controller) {
    require(controller)(app, config);
  });

  //---------------------------

  // finally the error middlewares
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  } else {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
    });
  }

};
