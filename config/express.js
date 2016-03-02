var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');

var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

var exphbs  = require('express-handlebars');

var flash = require('connect-flash');


module.exports = function (app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';
  app.locals.GOOGLE_ANALYTICS_ID = config.google_analytics_id;

  var hbs = exphbs.create({
    layoutsDir: config.root + '/app/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [
      // partials just for the server-side
      config.root + '/app/views/partials/',

      // partials shared between the server-side and client-side
      config.root + '/shared/templates'
    ],

    // Specify helpers which are only registered on this instance.
    // they can be overwritten (or added more) in for a specific view inside the specific 'render' method
    helpers: {
      global_helper: function () { return 'Global Helper'; },
      global_helper2: function () { return 'Global Helper 2'; }
    }
  });

  app.engine('handlebars', hbs.engine);
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');

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
  }, function (error) {
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

  // use connect-flash for flash messages stored in session
  app.use(flash());

  //---------------------------

  // add the passport middleware
  require('./passport')(app, config);

  //---------------------------

  // all other custom routes
  var routes = glob.sync(config.root + '/app/routes/*.js');
  routes.forEach(function (route) {
    require(route)(app, config);
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
      // TODO Rumen - fix when the err is just a String
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  } else {
    app.use(function (err, req, res, next) {
      // TODO Rumen - fix when the err is just a String
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
    });
  }

};
