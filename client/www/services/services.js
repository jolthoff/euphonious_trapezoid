sphero.factory('Auth', ['$http', 'SpheroApiUrl', '$window', 'player',
 function($http, SpheroApiUrl, $window, player) {

  var authFactory = {};

  token = null;
  username = null;
  isAuth = false;

  var useCred = function(userCredentials) {
    username = userCredentials.username;
    token = userCredentials.token;
    isAuth = true;
    //$http.defaults.headers.common['X-Auth-Token'] = userCredentials.token;
  };

  var anonUser = {
    username: 'anonymous',
    password: 'anon'
    };


  authFactory.signUp = function(username, password, email) {

    return $http({
      method: 'POST',
      url: SpheroApiUrl + '/player/signup',
      data: {
        username: username,
        password: password,
        email: email
      }
    });

  };

  authFactory.playAnon = function() {
    return anonUser;
  }

  authFactory.login = function(username, password) {

    return $http({
      method: 'POST',
      url: SpheroApiUrl + '/auth/login',
      data: {
        username: username,
        password: password
      }
    }).then(function(resp) {
      useCred(resp.data);
      return resp.data;
    }, function(err) {
      return false;
    });

  };

  authFactory.destroyCredentials = function() {
    $window.localStorage.removeItem('id_token');
    token = null;
    username = undefined;
    isAuth = false;
    player.profile = undefined;
    player.playerNum = null;
    //$http.defaults.headers.common['X-Auth-Token'] = undefined;
  };

  authFactory.checkAuth = function() {
    if (isAuth && token) {
      return true;
    } else {
      return false;
    }
  };

  authFactory.loadAuth = function(token) {
    token = token;
    isAuth = true;
    //add token decode to get user
    //will change this check to be server side later
  };

  authFactory.addFriend = function(otherPlayer, myID) {
    return $http({
      method: 'POST',
      url: SpheroApiUrl + '/player/friend',
      data: {
        friendName: otherPlayer,
        id: myID
      }
    }).then(function(resp){
      return resp;
    });
  };

  authFactory.updateProfile = function(profile) {
    return $http({
      method: 'POST',
      url: SpheroApiUrl + '/player/profile',
      data: {
        profile: profile
      }
    }).then(function(resp) {
      return resp;
    });
  };

  return authFactory;

}]);


/* This factory sets up a socket connection and gives you .on and .emit methods to use.
 */
sphero.factory('socket', ['SpheroApiUrl', '$rootScope', function(SpheroApiUrl, $rootScope) {
  var socket;
  // if (window.__karma__) { //in case we do testing with karma and phantom
  //   socket = io.connect(window.location.protocol + "//" + window.location.hostname + ":" + 1337);
  // } else {
  socket = io.connect(SpheroApiUrl);
  // }

  return socket;
  // return {
  //   on: function(eventName, callback) {
  //     socket.on(eventName, function() {
  //       var args = arguments;
  //       $rootScope.$apply(function() {
  //         callback.apply(socket, args);
  //       });
  //     });
  //   },
  //   emit: function(eventName, data, callback) {

  //     socket.emit(eventName, data, function() {
  //       var args = arguments;
  //       $rootScope.$apply(function() {
  //         if (callback) {
  //           callback.apply(socket, args);
  //         }
  //       });
  //     });
  //   }
  // };

}]);

sphero.factory('player', ['$window','jwtHelper', function($window, jwtHelper) {

  var playerNum = null;
  //information used to render to player in profile
  if ($window.localStorage.getItem('id_token')) {
    var tokenPayload = jwtHelper.decodeToken($window.localStorage.getItem('id_token'));
    var profile = tokenPayload;
  }
  return {
    playerNum: playerNum,
    profile: profile
  };
}]);
