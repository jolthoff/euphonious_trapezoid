sphero.controller('launchController', ['$scope', '$state', 'player', function($scope, $state, player) {

	$scope.join = function() {

<<<<<<< HEAD
		$state.go('loading', { action: 'join' });
=======
		$state.go('loading', {action: 'join' });
>>>>>>> 06dc4c57ad8bd84d9880e4e1083a5ab19d171ca2

	};

  $scope.profile = player.profile;
  console.log($scope.profile);

  $scope.logout = function() {
    Auth.destroyCredentials();
  };

	$scope.hostGame = function() {

<<<<<<< HEAD
		$state.go('profile.host');

	};

  $scope.init = function() {

    socket.emit('grabProfile', player.profile);

  };

  $scope.init();

=======
		$state.go('host');

	};

>>>>>>> 06dc4c57ad8bd84d9880e4e1083a5ab19d171ca2
}]);