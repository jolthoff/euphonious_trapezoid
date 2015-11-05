// hook into core game logic
var Game = require('../game/game.js');

var gameQueue = [];
var playersInRoom = {};
var activeUsers = {};

var invite = function(io, data) {

  io.to(data.socketID).emit('invited', {gameID: data.gameID, host: data.host});

};

var privateGame = function(io, data) {

  var gameId = ((Math.random() * 100000) || 0).toString();

  activeUsers[this.id].profile = data;
  activeUsers[this.id].joined = gameId;

  io.to(this.id).emit('hosting', gameId);
  this.join(gameId);

};

var joinPrivate = function(io, data) {

  this.join(data.gameID);

  activeUsers[this.id].joined = data.gameID;

  playersInRoom[data.gameID] = playersInRoom[data.gameID] || [];
  playersInRoom[data.gameID].push([data.profile, data.profile.userName]);

  console.log("the sockets connected to room are ", Object.keys(io.nsps['/'].adapter.rooms[data.gameID]));
  if(Object.keys(io.nsps['/'].adapter.rooms[data.gameID]).length === 3) {
    startGame(data.gameID, io);
  }

};

var grabProfile = function(io, data) {

  if (activeUsers[this.id]) {
    activeUsers[this.id] = { profile: data, joined: false };
    console.log("active user profile is ", activeUsers);
  };

};

var host = function(io, data) {
  // Create a unique Socket.IO Room
  if (!activeUsers[this.id].joined) {
    var gameId = ((Math.random() * 100000) || 0).toString();
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    // Join the Room and wait for the players
    activeUsers[this.id].profile = data;
    activeUsers[this.id].joined = gameId;

    console.log(activeUsers[this.id]);
    this.join(gameId);

    // io.sockets.socket(this.id).emit('hosting', gameId);
    gameQueue.push(gameId);


    console.log("DATA RECEIVED FROM HOST EVENT ", data);

    playersInRoom[gameId] = [];
    playersInRoom[gameId].push([data, data.userName]);
    console.log(playersInRoom);
  }

};

var join = function(io, data) {
  if (!activeUsers[this.id].joined) {
    if (gameQueue[0]) {

      activeUsers[this.id].joined = gameQueue[0];
      this.join(gameQueue[0]);

      playersInRoom[gameQueue[0]] = playersInRoom[gameQueue[0]] || [];

      playersInRoom[gameQueue[0]].push([data, data.userName]);

      console.log("Players in room at ", gameQueue[0], " are ", playersInRoom[gameQueue[0]]);
      if(Object.keys(io.nsps['/'].adapter.rooms[gameQueue[0]]).length === 3) {
        startGame(gameQueue.shift(), io);
      }
    } else {
      host.call(this, io, data);
    }
  }
};
var single = function(io, data) {
  var gameId = ((Math.random() * 100000) || 0).toString();
  this.join(gameId);

  console.log("gameId on single game is ", gameId, " and socketId is ", this.id);

  activeUsers[this.id] = activeUsers[this.id] || {};
  activeUsers[this.id].joined = gameId;

  playersInRoom[gameId] = [];
  playersInRoom[gameId].push([data, data.userName]);
  console.log("data from single event is " + data);
  console.log(playersInRoom);
  startGame(gameId, io);
};

var startGame = function(gameId, io) {
  var sockets = Object.keys(io.nsps['/'].adapter.rooms[gameId]).map(function(socketId) {
    return io.sockets.connected[socketId];
  });
  var players = [];
  for (var i = 0; i < sockets.length; i++) {
    players.push(String(i));
  };
  console.log("The players are!! ", players);
  var game = new Game();

  console.log("GAME MADE - IT IS " + game);

  if (players.length > 1) {
    var alreadyPlayed = false;

    var intervalID2 = setInterval( function() {
      players.push(players.shift());
      io.to(gameId).emit('turnEnded', { players: players, duration: 1000} );
      alreadyPlayed = false;
    }, 1000);
  }

  for (var i = 0; i < sockets.length; i++) {
    var socket = sockets[i];

    socket.on('insert', function(event) {
      if (players.length > 1) {
        if (event.state === players[0] && !alreadyPlayed) {
          alreadyPlayed = true;
          game.insert(event);
        }
      } else {
        game.insert(event);
      }
    });
    socket.emit('started', {playerNum: i});
    socket.emit('state', game.getState());
  }
  var events = ['put', 'removed', 'moved', 'rotated', 'fell', 'suspended', 'state'];
  for (i = 0; i < events.length; i++) {
    game.on(events[i], function(event) {
      io.to(gameId).emit(this, event);
    }.bind(events[i]));
  }
  var intervalID = setInterval( function( ) {
    if( !io.nsps['/'].adapter.rooms[gameId] ) {
      delete playersInRoom[gameId];
      game = null;
      clearInterval( intervalID );
      clearInterval( intervalID2 );
    }
  }, 10000 );

  game.on('ended', function() {
    var rank = game.rank();
    var playerRank = [];
    rank.forEach(function(player, index) {
      if (playersInRoom[gameId][player]) {
        playerRank.push(playersInRoom[gameId][player][0]);
      }
    });
    io.to(gameId).emit('ended', playerRank);

    for (var i = 0; i < sockets.length; i++) {
      console.log("socket id is ", sockets[i].id);
      activeUsers[sockets[i].id].joined = false;
      sockets[i].leave(gameId);
    }

    console.log("player Rank array is ", playerRank);
    delete playersInRoom[gameId];
    game = null;
    clearInterval( intervalID );
    clearInterval( intervalID2 );
  });

  console.log("ALL LISTENERS ATTACHED");
};

module.exports.init = function(io, socket) {

  activeUsers[socket.id] = true;

  socket.on('host', function(data){
    host.call(socket, io, data);
  });
  socket.on('join', function(data) {
    join.call(socket, io, data);
  });
  socket.on('single', function(data) {
    single.call(socket, io, data);
  });
  socket.on('privateGame', function(data) {
    privateGame.call(socket, io, data);
  });
  socket.on('invite', function(data) {
    invite.call(socket, io, data);
  });
  socket.on('joinPrivate', function(data) {
    joinPrivate.call(socket, io, data);
  });
  socket.on('grabProfile', function(data) {
    grabProfile.call(socket, io, data);
    io.emit('updateUsers', activeUsers);
  });
  socket.on('checkForUsers', function() {
    io.emit('updateUsers', activeUsers);
  });
  socket.on('leftGame', function() {
    console.log("user who submitted left game event is ", activeUsers[this.id].joined);
    this.leave(activeUsers[this.id].joined);
    activeUsers[this.id].joined = false;

  });

  socket.on('disconnect', function(){
    delete activeUsers[this.id];
    io.emit('updateUsers', activeUsers);

    console.log('socket id in activeUsers is ', activeUsers[this.id], ' and activeUsers is ', activeUsers);
    console.log('a user disconnected');
  });

};
