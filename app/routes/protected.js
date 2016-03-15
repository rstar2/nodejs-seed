var express = require('express'),
  router = express.Router();

var passportEnsureAuth = require('connect-ensure-login'); // this will add the ensureAuthenticated() function

module.exports = function (app) {
  app.use('/protected',
    passportEnsureAuth.ensureAuthenticated({redirectTo: '/auth/login'}),
    router);
};

/* Profile page */

router.get('/profile', function (req, res) {
  res.render('profile', {account: req.user});
});

