
const express = require('express');
const client = express();

const passport = require('passport');
const CommonOauth2Strategy = require('passport-common-oauth2').Strategy;

client.use(require('cookie-parser')());
client.use(require('body-parser').urlencoded({ extended: true }));
client.use(require('express-session')({ resave: true, saveUninitialized: true }));
// Use session. user profile will be stored in req.session.passport
client.use(passport.initialize());
client.use(passport.session());

// A User service
class User {
  static findOrCreate(profile, cb) {}
  static findById(id, cb) {}
}

// serialize&deserialize of user info
// must be implemented
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// use Strategy
passport.use(new CommonOauth2Strategy({
    clientID: 'sample_app',
    clientSecret: 'this_is_the_client_secret',
    callbackURL: "http://127.0.0.1:3001/auth/common/callback",
    scope: 'user_info:read',
    state: 'default',
    // authorizationURL: 'http://127.0.0.1:3002/oauth/authorize',
    // tokenURL: 'http://127.0.0.1:3002/oauth/token',
    // userProfileURL: 'http://127.0.0.1:3002/api/user/detail',
  },
  function(accessToken, refreshToken, profile, cb) {
    // ...
    User.findOrCreate(profile, function (err, user) {
      return cb(err, user);
    });
  }
));

// Route configuration
client.get('/auth/github', passport.authenticate('github'));

client.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

client.get('/', (req, res) => {
  console.log('req.session.passport', req.session.passport);
  res.send('Hello World!');
});

const port = 3001;
client.listen(port, () => console.log(`Example oauth2 client listening on port ${port}!`));