sphero.controller('hostController', ['$scope', '$state', 'socket', 'player', 
	function($scope, $state, socket, player) {

	$scope.activeUsers = {};
	$scope.activeGame = null;

	$scope.host = function() {

		socket.emit('host', player.profile);

	};

	$scope.invite = function(username) {
    if ($scope.activeUsers[username]) {
      socket.emit('invite', {socketID: $scope.activeUsers.name.socketID, room: $scope.activeGame);
    }
	};

  socket.on('started', function(data) {
    player.playerNum = String(data.playerNum);
    $state.go('profile.game');
  });

  socket.on('hosting', function(data) {

  	$scope.activeGame = data;
  	console.log($scope.activeGame);
  });

  socket.on('updateUsers', function(data) {
    $scope.activeUsers = {};
  	for (var socket in data) {
      if (data[socket].profile) {
        $scope.activeUsers[data[socket].profile.userName] = { joined: data[socket].joined, socketID: socket };
      }
    };
    console.log($scope.activeUsers);
  });

  $scope.init = function() {
    socket.emit('checkForUsers');
  };

}]);