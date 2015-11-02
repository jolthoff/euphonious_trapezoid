sphero.controller('launchController', ['$scope', '$state', 'player', function($scope, $state, player) {



	$scope.join = function() {

		$state.go('profile.loading', { action: 'join' });

	};

  $scope.profile = player.profile;
  console.log($scope.profile);

  $scope.logout = function() {
    Auth.destroyCredentials();
  };

	$scope.hostGame = function() {

		$state.go('profile.host');

	};

  $scope.init = function() {

    socket.emit('grabProfile', player.profile);

  };

}]);
