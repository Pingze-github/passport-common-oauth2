
const users = {};

class User {
  static findOrCreate(profile, cb) {
    const id = profile.id;
    const user = {
      id: profile.id,
      username: profile.username,
      emails: profile.emails,
    };
    if (!users[id]) {
      users[id] = user;
    }
    cb(null, user)
  }

  static findById(id, cb) {
    cb(null, users[id])
  }
}

module.exports = User;