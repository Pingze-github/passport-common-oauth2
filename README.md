# passport-common-oauth2
A Passport strategy for common OAuth2.0 Authentication Server.

[Passport](http://passportjs.org/) strategy for authenticating with Common Authentication Service
using the OAuth 2.0 API.

Recommend to use with [common-oauth2-server]()

## Usage

Here is an express client using passport-common-oauth2.

```
const passport = require('passport');
const CommonOauth2Strategy = require('passport-common-oauth2').Strategy;

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

```

## Example
See /example

## License

[The MIT License](http://opensource.org/licenses/MIT)
