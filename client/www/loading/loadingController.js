sphero.controller('loadingController', ['$scope', '$state', '$stateParams', 'socket', 'player', 
  function($scope, $state, $stateParams, socket, player) {

  	var action = $stateParams.action;

    if (action === 'single') {
      socket.emit('single', player.profile);
    } else if (action === 'join') {
      socket.emit('join', player.profile);
    } else if (action === 'host') {
      socket.emit('host', player.profile);
    }

    $scope.profile = player.profile;
    console.log($scope.profile);

    socket.on('started', function(data) {
      player.playerNum = String(data.playerNum);
      $state.go('profile.game');
    });

}]);