var Bot = require(require('path').join('..','..','core','bot.js'));

/**
 * Spotify Bot
 * @class Spotify
 * @augments Bot
 * @param {string} name
 * @param {string} folder
 * @param {Spotify~Configuration[]} allConfigurations
 * @constructor
 */
function Spotify(name, folder, allConfigurations){
  Bot.call(this, name, folder, allConfigurations);

  this.defaultValues.hostname = 'api.spotify.com';
  
  this.defaultValues.httpModule = 'https';
  this.defaultValues.pathPrefix = '/v1/';
  this.defaultValues.port = 443;
  this.defaultValues.scopes = 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private streaming user-follow-modify user-follow-read user-library-read user-library-modify user-read-private user-read-birthdate user-read-email user-top-read';
  
  this.defaultValues.defaultRemainingRequest = 100;
  this.defaultValues.defaultRemainingTime = 60*15;
}

Spotify.prototype = new Bot();
Spotify.prototype.constructor = Spotify;

/**
 * Prepare and complete parameters for request
 * @param {Bot~doRequestParameters} parameters
 * @param {Bot~requestCallback|*} callback
 */
Spotify.prototype.prepareRequest = function(parameters, callback) {
  this.addQueryAccessToken(parameters);
  this.doRequest(parameters, callback);
};

/**
 * API me
 * @param {Spotify~requestCallback} callback
 */
Spotify.prototype.me = function(callback) {
  var params = {
    method: 'GET',
    path: 'me',
    output: {
      model: 'User'
    }
  };

  this.prepareRequest(params, callback);
};


/**
 * Add access token to query parameters
 * @param {Bot~doRequestParameters} parameters
 */
Spotify.prototype.addQueryAccessToken = function(parameters) {
  if(parameters.headers === undefined) {
    parameters.headers = {};
  }

  parameters.headers['Authorization'] = 'Bearer ' + this.accessToken.access_token;
};

/**
 * Get remaining requests from result 
 * @param {Request~Response} resultFromRequest
 * @return {Number}
 */
Spotify.prototype.getRemainingRequestsFromResult = function(resultFromRequest) {
  return this.defaultValues.defaultRemainingRequest - 1;
  // throw this.RError('XXX-008', "Implement getRemainingRequestsFromResult");
  // return resultFromRequest.headers['x-ratelimit-remaining'] >> 0;
};

/**
 * Get url for Access Token when you have to authorize an application
 * @param {string} scopes
 * @param {*} callback
 */
Spotify.prototype.getAccessTokenUrl = function(scopes, callback) {
  var url = 'https://accounts.spotify.com/authorize?'
    + 'response_type=code&'
    + 'redirect_uri=' + this.currentConfiguration.callback_uri + '&'
    + 'client_id=' + this.currentConfiguration.client_id + '&'
    + 'scope=' + this.getScopeForAccessTokenServer(scopes);

  callback(url);
};

/**
 * Extract response in data for Access Token
 * @param {Object} req request from local node server
 * @return {*} code or something from response
 */
Spotify.prototype.extractResponseDataForAccessToken = function(req) {
  var query = require('url').parse(req.url, true).query;

  if(query.code === undefined) {
    return null;
  }

  return query.code;
};

/**
 * Request Access Token after getting code
 * @param {string} responseData
 * @param {Bot~requestAccessTokenCallback} callback
 */
Spotify.prototype.requestAccessToken = function(responseData, callback) {
  var params = {
    method: 'POST',
    hostname: 'accounts.spotify.com',
    pathPrefix: '',
    path: 'api/token',
    post: {
      client_id: this.currentConfiguration.client_id,
      client_secret: this.currentConfiguration.client_secret,
      grant_type: "authorization_code",
      code: responseData,
      redirect_uri: this.currentConfiguration.callback_uri
    }
  };

  this.request(params, function(error, result){
    if(error) {
      callback(error, null);
      return;
    }

    if(result.statusCode === 200) {
      callback(null, JSON.parse(result.data));
    }
    else {
      callback(JSON.parse(result.data), null);
    }
  });
};

/**
 * getAccessTokenFromAccessTokenData
 * @param {*} accessTokenData
 * @return {*}
 */
Spotify.prototype.getAccessTokenFromAccessTokenData = function(accessTokenData) {
  return accessTokenData.access_token;
};

/**
 * getTypeAccessTokenFromAccessTokenData
 * @param {*} accessTokenData
 * @return {*}
 */
Spotify.prototype.getTypeAccessTokenFromAccessTokenData = function(accessTokenData) {
  return accessTokenData.token_type;
};

/**
 * getUserForNewAccessToken
 * @param {*} formatAccessToken
 * @param {Bot~getUserForNewAccessTokenCallback} callback
 */
Spotify.prototype.getUserForNewAccessToken = function(formatAccessToken, callback) {
  var that = this;

  that.setCurrentAccessToken(formatAccessToken.access_token);
  that.verifyAccessTokenScopesBeforeCall = false;
  this.me(function(err, user){
    that.verifyAccessTokenScopesBeforeCall = true;
    if(err) {
      callback(err, null);
    }
    else {
      var username = (user !== null) ? user.getId() : null;
      callback(null, username);
    }
  });
};

Spotify.prototype.extractDataFromRequest = function(data) {
  return data;
};

module.exports = Spotify;

/**
 * Spotify Configuration
 * @typedef {Object} Spotify~Configuration
 * @property {string} name
 * @property {string} client_id
 * @property {string} client_secret
 * @property {string} access_token
 * @property {string} callback_uri
 * @property {string} scopes
 */
/**
 * Request callback
 * @callback Spotify~requestCallback
 * @param {Error|string|null} error - Error
 * @param {*} data
 */
