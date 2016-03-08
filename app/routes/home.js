var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

module.exports = function (app, config, hbs) {
  app.use('/', router);

  router.get('/', function (req, res, next) {
    Article.find(function (err, articles) {
      if (err) return next(err);
      res.render('index', {
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
          // get hbs.handlebars instance from express.js (to use the cache)
          // or just use the global Handlebars instance ( require('handlebars') )
          specific_partial: hbs.handlebars.compile('<h1>Specific partial</h1><p>{{message}}</p>')
        })
      });
    });
  });
};


