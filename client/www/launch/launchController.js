sphero.controller('launchController', ['$scope', '$state', 'player', function($scope, $state, player) {

	$scope.join = function() {

		$state.go('loading', {action: 'join' });

	};

  $scope.profile = player.profile;
  console.log($scope.profile);

  $scope.logout = function() {
    Auth.destroyCredentials();
  };

	$scope.host = function() {

		$state.go('host');

	};

}]);