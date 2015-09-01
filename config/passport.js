

// passport middleware config
var Account = mongoose.model('Account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  Account.findById(id, function (err, user) {
    done(err, user);
  });
});

// login authorization support with password middleware
app.use(passport.initialize());
app.use(passport.session());
