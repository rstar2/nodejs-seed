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
      // Account.findOne wont fire unless data is sent back
      process.nextTick(function () {
        // find a account whose email is the same as the forms email
        // we are checking to see if the account trying to login already exists
        Account.findOne({'local.email': email}, function (err, account) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if there's already an account with that email
          if (account) {
            return done(null, false, 'That email is already taken.');
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
      // asynchronous
      process.nextTick(function () {
        // find a account whose email is the same as the forms email
        // we are checking to see if the account trying to login already exists
        Account.findOne({'local.email': email}, function (err, account) {
          // if there are any errors, return the error before anything else
          if (err)
            return done(err);

          // if no account is found, return the message
          if (!account)
            return done(null, false, 'No account found with that email.');

          // if the account is found but the password is wrong
          try {
            if (!account.validPassword(password))
              return done(null, false, 'Oops! Wrong password.');
          } catch (e) {
            return done(e, false, 'Oops! Failed password.');
          }

          // all is well, return successful account
          return done(null, account);
        });
      });
    }));

  // =========================================================================
  // FACEBOOK AUTH ===========================================================
  // =========================================================================

  if (config.facebook.enabled) {
    var FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
        clientID: config.facebook.appKey,
        clientSecret: config.facebook.appSecret,
        callbackURL: config.facebook.callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },
      function (req, accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
          // check if the account is already logged in
          if (!req.user) {
            // find the account in the database based on their facebook id
            Account.findOne({'facebook.id': profile.id}, function (err, account) {
              // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err)
                return done(err);

              // if the account is found, then log them in
              if (account) {
                // if there is a facebook id already but no token (account was linked at one point and then removed)
                if (!account.facebook.token) {
                  account.facebook.token = accessToken;
                  account.facebook.name = profile.displayName;
                  if (profile.email) {
                    account.facebook.email = profile.email;
                  } else if (profile.emails && profile.emails.length) {
                    account.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                  }

                  account.save(function (err) {
                    if (err)
                      throw err;
                    return done(null, account);
                  });
                }

                return done(null, account); // account found, return that account
              } else {
                // if there is no account found with that facebook id, create them
                var newAccount = new Account();

                // set all of the facebook information in our Account model
                newAccount.facebook.id = profile.id;
                newAccount.facebook.token = accessToken;
                newAccount.facebook.name = profile.displayName;
                if (profile.email) {
                  newAccount.facebook.email = profile.email;
                } else if (profile.emails && profile.emails.length) {
                  newAccount.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                }

                // save our account to the database
                newAccount.save(function (err) {
                  if (err)
                    throw err;

                  // if successful, return the new account
                  return done(null, newAccount);
                });
              }
            });

          } else {
            // account already exists and is logged in, we have to link accounts
            var account = req.user; // pull the account out of the session

            // update the current account's facebook credentials
            account.facebook.id = profile.id;
            account.facebook.token = accessToken;
            account.facebook.name = profile.displayName;
            if (profile.email) {
              account.facebook.email = profile.email;
            } else if (profile.emails && profile.emails.length) {
              account.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            }

            // save the account
            account.save(function (err) {
              if (err)
                throw err;
              return done(null, account);
            });
          }

        });
      }
    ));

  }

};
