
const express = require('express');
const client = express();

const passport = require('passport');
const CommonOauth2Strategy = require('passport-common-oauth2').Strategy;

client.use(require('cookie-parser')());
client.use(require('body-parser').urlencoded({ extended: true }));
client.use(require('express-session')({ secret: 'secret', resave: true, saveUninitialized: true }));
// Use Middleware. To use req.session.passport
client.use(passport.initialize());
client.use(passport.session());

// A User service
const User = require('./User');

const port = 3001;

// serialize&deserialize session.passport.user of user profile
// must be implemented
// Here, only save profile.id in session, need to load more from User
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
    callbackURL: `http://127.0.0.1:${port}/auth/common/callback`,
    scope: 'user_info:read',
    // state: 'default',
    // Configure these if you use an common-oauth2-server at different address
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

// Authenticate Requests configuration
client.get('/auth/common', passport.authenticate('common-oauth2'));

client.get('/auth/common/callback',
  passport.authenticate('common-oauth2', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


client.get('/', (req, res) => {
  console.log('req.session.passport', req.session.passport);
  console.log('req.user', req.user);
  res.send('Hello World!');
});

client.listen(port, () => console.log(`Example oauth2 client listening on port ${port}!`));