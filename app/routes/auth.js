var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('mongoose').model('Account');

module.exports = function (app) {
  app.use('/', router);
};

// ---------------------

/* Register page */

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', {
          account : account,
          info: "Sorry. That username already exists. Try again."}
      );
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

/* Login page */

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/* Logout page */

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/profile',
  // todo - passportEnsureAuth.ensureAuthenticated(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
