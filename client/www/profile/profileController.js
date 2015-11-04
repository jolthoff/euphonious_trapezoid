sphero.controller('profileController', ['$scope', '$window', 'Auth', 'socket', '$state', 'player',
  function($scope, $window, Auth, socket, $state, player) {

  	$scope.profile = player.profile;
    $scope.friends = player.profile.friends;

    $scope.invites = [];


    $scope.home = function() {
      setTimeout(function() {$state.go('nav');}, 500);
    };
  	$scope.logout = function() {
  		Auth.destroyCredentials();
      setTimeout(function() {$state.go('nav');}, 500);
  	};

    $scope.joinPrivate = function(gameID) {
      console.log(gameID);
      $state.go('profile.loading', { action: 'joinPrivate' })
    };

    socket.on('invited', function(data) {
      var found = false;
      for (var i = 0; i < $scope.invites.length; i++) {
        if ($scope.invites[i].host === data.host) {
          found = true;
        }
      }
      if (!found) {
        $scope.invites.push(data);
      }
    });

  }
]);
