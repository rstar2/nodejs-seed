var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

// get hbs.handlebars instance from express.js (to use the cache)
// or just use the global Handlebars instance ( require('handlebars') )
var hbs = null; // require('handlebars');

module.exports = function (app, config1, hbs1) {
  app.use('/', app.exposeTemplates, router);
  hbs = hbs1;
};

/* Home page */

router.get('/', function (req, res, next) {
  // if user is already authenticated (e.g. logined) then go straight to the protected prifile page
  if (req.isAuthenticated()) {
    res.redirect('/protected/profile');
    return;
  }

  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('home', {
      title: 'Generator-Express MVC',
      articles: articles,

      //message: req.params.message,
      message: req.query.message,


      // Overwrite some handlebars options
      //layout: 'secondLayout',
      //helpers: {
      //  global_helper: function () {
      //    return 'Overwrite Helper';
      //  },
      //  specific_helper: function () {
      //    return 'Specific Helper';
      //  }
      //},
      //partials: {
      //  global_partial: function () {
      //    return 'Overwrite Global Partial';
      //  },
      //  shared_partial: function () {
      //    return 'Overwrite Shared Partial';
      //  },
      //  specific_partial: function () {
      //    return 'Specific partial';
      //  }
      //},
      // this can also be a promise instance that compile async
      partials: Promise.resolve({
        specific_partial: hbs.handlebars.compile('<h1>Specific partial</h1><p>{{message}}</p>')
      })
    });
  });
});


