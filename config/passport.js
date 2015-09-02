var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (app, config) {
  app.use(passport.initialize());
  app.use(passport.session());

  // passport middleware config
  var Account = mongoose.model('Account');

  passport.serializeUser(function (account, done) {
    done(null, account.id);
  });
  passport.deserializeUser(function (id, done) {
    Account.findById(id, function (err, account) {
      done(err, account);
    });
  });

  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  // =========================================================================
  // LOCAL REGISTER ==========================================================
  // =========================================================================
  passport.use('local-register', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function () {
        // find a account whose email is the same as the forms email
        // we are checking to see if the account trying to login already exists
        Account.findOne({'local.email': email}, function (err, account) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if there's already an account with that email
          if (account) {
            return done(null, false, req.flash('registerMessage', 'That email is already taken.'));
          } else {
            // if there is no account with that email create the account
            var newAccount = new Account();

            // set the account's local credentials
            newAccount.local.email = email;
            newAccount.local.password = newAccount.generateHash(password);

            // save the account
            newAccount.save(function (err) {
              if (err)
                throw err;
              return done(null, newAccount);
            });
          }
        });
      });
    }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) { // callback with email and password from our form
      // find a account whose email is the same as the forms email
      // we are checking to see if the account trying to login already exists
      Account.findOne({'local.email': email}, function (err, account) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no account is found, return the message
        if (!account)
          return done(null, false, req.flash('loginMessage', 'No account found with that email.')); // req.flash is the way to set flashdata using connect-flash

        // if the account is found but the password is wrong
        if (!account.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful account
        return done(null, account);
      });
    }));

};
