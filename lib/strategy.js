// Load modules.
var OAuth2Strategy = require('passport-oauth2')
  , util = require('util')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , APIError = require('./errors/apierror');

var pkg = require('../package');

/**
 * `Strategy` constructor.
 *
 * The Common authentication strategy authenticates requests by delegating to
 * A Common Authentication Server using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your application's Client ID
 *   - `clientSecret`  your application's Client Secret
 *   - `callbackURL`   URL to which will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.
 *   — `userAgent`     All API requests MUST include a valid User Agent string.
 *                     e.g: domain name of your application.
 *   — `state`         any chars. will be return in callback
 *   - `provider`      Optional. Will be added in user profile
 * Examples:
 *
 *     passport.use(new CommonStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/common/callback',
 *         userAgent: 'myapp.com',
 *         state: 'default',
 *         provider: 'common-oauth',
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'http://127.0.0.1:3002/oauth/authorize';
  options.tokenURL = options.tokenURL || 'http://127.0.0.1:3002/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || pkg.name;
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = pkg.name;
  this.provider = options.provider || pkg.name;
  this._userProfileURL = options.userProfileURL || 'http://127.0.0.1:3002/api/user/detail';
  this._oauth2.useAuthorizationHeaderforGET(true);
  
  // NOTE: GitHub returns an HTTP 200 OK on error responses.  As a result, the
  //       underlying `oauth` implementation understandably does not parse the
  //       response as an error.  This code swizzles the implementation to
  //       handle this condition.
  var self = this;
  var _oauth2_getOAuthAccessToken = this._oauth2.getOAuthAccessToken;
  this._oauth2.getOAuthAccessToken = function(code, params, callback) {
    _oauth2_getOAuthAccessToken.call(self._oauth2, code, params, function(err, accessToken, refreshToken, params) {
      if (err) { return callback(err); }
      if (!accessToken) {
        return callback({
          statusCode: 400,
          data: JSON.stringify(params)
        });
      }
      callback(null, accessToken, refreshToken, params);
    });
  }
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Common Authentication Server
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         default 'common-oauth'
 *   - `id`               the user's ID
 *   - `username`         the user's username
 *   - `nickName`         the user's nick name
 *   - `profileUrl`       the URL of the profile for the user
 *   - `emails`           the user's email addresses
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var self = this;
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      
      if (json && json.message) {
        return done(new APIError(json.message));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);

    profile.provider  = this.provider;
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
}


// Expose constructor.
module.exports = Strategy;
