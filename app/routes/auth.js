var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('mongoose').model('Account');

var passportEnsureAuth = require('connect-ensure-login'); // this will add the ensureAuthenticated() function

module.exports = function (app) {
  app.use('/', router);
};

// ---------------------

/* Register page */

// show the register form
router.get('/register', function (req, res) {
  // render the page and pass in any flash data if it exists
  res.render('register', { message: req.flash('registerMessage') });
});

// process the register form
router.post('/register', passport.authenticate('local-register', {
  successRedirect: '/profile', // redirect to the secure profile section
  failureRedirect: '/register', // redirect back to the register page if there is an error
  failureFlash: true // allow flash messages
}));

/* Login page */

// show the login form
router.get('/login', function (req, res) {
  // render the page and pass in any flash data if it exists
  res.render('login', { account: req.user, message: req.flash('loginMessage') });
});

// process the login form
router.post('/login', function (req, res, next) {
  passport.authenticate('local-login', {
    successRedirect : req.session.returnTo || '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  })(req, res, next);
});

/* Logout page */

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/profile',
  passportEnsureAuth.ensureAuthenticated(),
  function (req, res) {
    res.render('profile', {account: req.user});
  });
