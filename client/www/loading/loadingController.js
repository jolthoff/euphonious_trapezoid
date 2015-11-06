sphero.controller('loadingController', ['$scope', '$state', '$stateParams', 'socket', 'player', 'game',
  function($scope, $state, $stateParams, socket, player, game) {


  	var action = $stateParams.action;
    if (action === null) {
      $state.go('nav');
    } else if (action === 'single') {
      socket.emit('single', player.profile);
      game.gameInfo.isSingle = true;
    } else {
      game.gameInfo.isSingle = false;
      if (action === 'join') {
        socket.emit('join', player.profile);
      } else if (action === 'host') {
        socket.emit('host', player.profile);
      } else if (action === 'joinPrivate') {
        console.log($stateParams.gameID);
        socket.emit('joinPrivate', { profile: player.profile, gameID: $stateParams.gameID });
      }
    }

    socket.on('started', function(data) {
      player.playerNum = String(data.playerNum);
      $state.go('profile.game');
    });

}]);
