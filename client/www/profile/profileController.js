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
      $state.go('profile.loading', { action: 'joinPrivate' })
    };

    socket.on('invite', function(data) {
      $scope.invites.push(data);
      console.log($scope.invites);
    });

  }
]);
