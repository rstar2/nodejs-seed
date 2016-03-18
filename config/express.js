var express = require('express');
var glob = require('glob');
var extend = require('node.extend');

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

  //---------------------------
  // View/template engine - in this case Handlebars
  //---------------------------

  var hbs = exphbs.create({
    layoutsDir: config.root + '/app/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [
      // partials just for the server-side
      config.root + '/app/views/partials/',

      // partials shared between the server-side and client-side
      config.root + '/app/views/shared_templates'
    ],

    // Specify helpers which are only registered on this instance.
    // they can be overwritten (or added more) in for a specific view inside the specific 'render' method
    //helpers: {
    //  global_helper: function () { return 'Global Helper'; },
    //  global_helper2: function () { return 'Global Helper 2'; }
    //},
    // or just defined all the  helpers inside another JavaScript file
    helpers: require('./../app/helpers')
  });

  app.engine('handlebars', hbs.engine);
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');

  // Middleware to expose the app's shared templates to the cliet-side of the app
  // for pages which need them.
  function exposeTemplates(req, res, next) {
    // Uses the `ExpressHandlebars` instance to get the get the **precompiled**
    // templates which will be shared with the client-side of the app.
    hbs.getTemplates(config.root + '/app/views/shared_templates', {
      cache      : app.enabled('view cache'),
      precompiled: true
    }).then(function (templates) {
      // RegExp to remove the ".handlebars" extension from the template names.
      var extRegex = new RegExp(hbs.extname + '$');

      // Creates an array of templates which are exposed via
      // `res.locals.templates`.
      templates = Object.keys(templates).map(function (name) {
        return {
          name    : name.replace(extRegex, ''),
          template: templates[name]
        };
      });

      // Exposes the templates during view rendering.
      if (templates.length) {
        res.locals.templates = templates;
      }

      setImmediate(next);
    })
      .catch(next);
  }
  app.exposeTemplates = exposeTemplates;

  //---------------------------
  //---------------------------
  //---------------------------

  // uncomment after placing your favicon in /public
  // the favicon is cached in memory - not read each time from the file
  //var favicon = require('serve-favicon');
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
  //---------------------------
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
  app.use(session(extend(true, {}, config.session, {
    // Force a cookie to be set on every response. This resets the expiration date.
    rolling: false,
    // Forces the session to be saved back to the session store, even if the session was never modified during the request
    resave: false,
    // Forces a session that is "uninitialized" to be saved to the store.
    // Choosing false is useful for implementing login sessions
    saveUninitialized: false,

    // use MongoDB
    store: mongoStoreSession
  })));

  //---------------------------
  //---------------------------
  //---------------------------

  // use connect-flash for flash messages stored in session
  app.use(flash());

  //---------------------------
  //---------------------------
  //---------------------------

  // add the passport middleware
  require('./passport')(app, config);

  //---------------------------
  //---------------------------
  //---------------------------

  // all other custom routes
  var routes = glob.sync(config.root + '/app/routes/*.js');
  routes.forEach(function (route) {
    require(route)(app, config, hbs);
  });

  //---------------------------
  //---------------------------
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
