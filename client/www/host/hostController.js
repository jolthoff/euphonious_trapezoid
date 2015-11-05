sphero.controller('hostController', ['$scope', '$state', 'socket', 'player',
	function($scope, $state, socket, player) {

	$scope.activeUsers = {};
	$scope.activeGame = null;
  $scope.showUsers = false;

	$scope.public = function() {
    socket.emit('leftGame');
    $state.go('profile.loading', { action: 'host' });

	};

  $scope.toggleShowUsers = function() {
    socket.emit('checkForUsers');
    $scope.showUsers = !$scope.showUsers;

  }

	$scope.invite = function(username) {
    if ($scope.activeUsers[username]) {
      console.log("active game is at ", $scope.activeGame);
      socket.emit('invite', {
        socketID: $scope.activeUsers[username].socketID,
        gameID: $scope.activeGame,
        host: player.profile.userName
      });

    }
	};

  socket.on('started', function(data) {
    console.log("did i get this event?");
    player.playerNum = String(data.playerNum);
    $state.go('profile.game');
  });

  socket.on('hosting', function(data) {
  	$scope.activeGame = data;
  	console.log("did i receive this event? ", $scope.activeGame);
  });

  socket.on('updateUsers', function(data) {
    $scope.activeUsers = {};
  	for (var socket in data) {

      if (data[socket].profile && data[socket].profile.userName !== 'anonymous') {
        $scope.activeUsers[data[socket].profile.userName] = {
          name: data[socket].profile.userName,
          joined: data[socket].joined,
          socketID: socket
        };
      }
    }
    console.log($scope.activeUsers);
  });

  $scope.init = function() {
    socket.emit('checkForUsers');
    socket.emit('privateGame', player.profile);
  };

  $scope.init();

}]);
