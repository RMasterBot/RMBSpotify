/**
 * User Model
 * @class User
 * @param {User~Json} json of the user
 * @constructor
 */
function User(json) {
  this.user = json;
}

/**
 * @return {User~Json|*}
 */
User.prototype.getJson = function() {
  return this.user;
};

/**
 * @return {string}
 */
User.prototype.getId = function() {
  return this.user.id;
};

/**
 * @return {string}
 */
User.prototype.getName = function() {
  return this.user.name;
};

module.exports = User;

/**
 * User Json
 * @typedef {Object} User~Json
 * @property {string} id
 * @property {string} name
 */