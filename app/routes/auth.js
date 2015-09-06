var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('mongoose').model('Account');

module.exports = function (app, config) {
  app.use('/auth', router);


// ---------------------

  /* Register page */

// show the register form
  router.get('/register', function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/protected/profile');
    } else {
      // render the page and pass in any flash data if it exists
      res.render('register', {account: req.user, message: req.flash('error')});
    }
  });

// process the register form
  router.post('/register', passport.authenticate('local-register', {
    successRedirect: '/protected/profile', // redirect to the secure profile section
    failureRedirect: '/auth/register', // redirect back to the register page if there is an error
    failureFlash: true // allow flash messages
  }));

  /* Login page */

// show the login form
  router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/protected/profile');
    } else {
      // render the page and pass in any flash data if it exists
      res.render('login', {account: req.user, message: req.flash('error')});
    }
  });

// process the login form
  router.post('/login', function (req, res, next) {
    passport.authenticate('local-login', {
      successRedirect: req.session.returnTo || '/protected/profile', // redirect to the secure profile section
      failureRedirect: '/auth/login', // redirect back to the signup page if there is an error
      failureFlash: true // allow flash messages
    })(req, res, next);
  });

  /* Logout page */

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

// add auth with
  if (config.facebook.enabled) {
    // send to Facebook to do the authentication
    router.get('/facebook', passport.authenticate('facebook', {scope: config.facebook.scope}));

    // handle the callback after Facebook has authenticated the user
    router.get('/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/protected/profile',
        failureRedirect: '/'
      }));


    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================
    // TODO Rumen - check
    // locally --------------------------------
    router.get('/connect/local', function (req, res) {
      res.render('connect-local.ejs', {message: req.flash('error')});
    });
    router.post('/connect/local', passport.authenticate('local-signup', {
      successRedirect: '/protected/profile', // redirect to the secure profile section
      failureRedirect: '/auth/connect/local', // redirect back to the signup page if there is an error
      failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    router.get('/connect/facebook', passport.authorize('facebook', {scope: config.facebook.scope}));

    // handle the callback after facebook has authorized the user
    router.get('/connect/facebook/callback',
      passport.authorize('facebook', {
        successRedirect: '/protected/profile',
        failureRedirect: '/'
      }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', function(req, res) {
      var user            = req.user;
      user.local.email    = undefined;
      user.local.password = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', function(req, res) {
      var user            = req.user;
      user.facebook.token = undefined;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });


  }

};
