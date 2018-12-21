/**
 * Parse profile.
 *
 * Parse common importtant items
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }

  var profile = {};
  // user id
  profile.id = String(json.id);
  // user name
  profile.username = json.name || json.username;
  // nickname
  profile.nickName = json.nickname;
  // user homepage url
  profile.profileUrl = json.html_url;
  // emails
  if (json.email) {
    profile.emails = [{ value: json.email }];
  }
  // avatar
  if (json.avatar_url) {
    profile.photos = [{ value: json.avatar_url }];
  }

  return profile;
};
