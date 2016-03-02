var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

var Handlebars = require('handlebars');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles,
      message: req.params.message,


      // Overwrite some handlebars options
      //layout: 'secondLayout',
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
        // TODO Rumen - get hbs.handlebars instance from express.js
        // or just use the global Handlebars instance
        specific_partial: Handlebars.compile('<p>ECHO: {{message}}</p>')
      }),
      //helpers: {
      //  global_helper: function () {
      //    return 'Overwrite Helper';
      //  },
      //  specific_helper: function () {
      //    return 'Specific Helper';
      //  }
      //}
    });
  });
});
