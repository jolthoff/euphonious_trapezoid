// hook into core game logic
var Game = require('../game/game.js');

var gameQueue = [];
var playersInRoom = {};
var activeUsers = {};


var invite = function(io, data) {

  io.to(data.socketID).emit('invited', { gameID: data.gameID, host: data.host });

};

var privateGame = function(io, data) {
  var gameId = (1 + Math.random() * 100000).toString();


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

  if(Object.keys(io.nsps['/'].adapter.rooms[data.gameID]).length === 3) {
    startGame(data.gameID, io);
  }

};

var grabProfile = function(io, data) {

  if (activeUsers[this.id]) {
    activeUsers[this.id] = { profile: data, joined: false };
    io.emit('updateUsers', activeUsers);
  };

};

var host = function(io, data) {
  // Create a unique Socket.IO Room
  if (!activeUsers[this.id].joined) {
    var gameId = (1 + Math.random() * 100000).toString();

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    // Join the Room and wait for the players
    activeUsers[this.id].profile = data;
    activeUsers[this.id].joined = gameId;

    this.join(gameId);

    gameQueue.push(gameId);

    playersInRoom[gameId] = [];
    playersInRoom[gameId].push([data, data.userName]);
  }

};

var join = function(io, data) {
  if (!activeUsers[this.id].joined) {
    if (gameQueue[0]) {

      activeUsers[this.id].joined = gameQueue[0];
      this.join(gameQueue[0]);

      playersInRoom[gameQueue[0]] = playersInRoom[gameQueue[0]] || [];
      playersInRoom[gameQueue[0]].push([data, data.userName]);

      if(Object.keys(io.nsps['/'].adapter.rooms[gameQueue[0]]).length === 2) {
        startGame(gameQueue.shift(), io);
      }
    } else {
      host.call(this, io, data);
    }
  }
};
var single = function(io, data) {
  // grab profile of user starting a single game event
  activeUsers[this.id] = { profile: data, joined: false };
  if (!activeUsers[this.id].joined) {
    var gameId = (1 + Math.random() * 100000).toString();
    this.join(gameId);

    //hold on to gameId information to force user out when they leave the game window
    activeUsers[this.id].joined = gameId;
    playersInRoom[gameId] = [];
    playersInRoom[gameId].push([data, data.userName]);

    startGame(gameId, io);
  }
};

var startGame = function(gameId, io) {
  var sockets = Object.keys(io.nsps['/'].adapter.rooms[gameId]).map(function(socketId) {
    return io.sockets.connected[socketId];
  });
  var players = [];
  for (var i = 0; i < sockets.length; i++) {
    players.push(String(i));
  };
  var game = new Game();

  var insertListener = function(event) {

    game.insert(event);

  };
  // -- FOR TURN IMPLEMENTATION -- //
  // if (players.length > 1) {
  //   var alreadyPlayed = false;
  // -- Turns commented out for possible future use  -- //
  // if (players.length > 1) {
  //   var alreadyPlayed = false;
  //   var intervalID2 = setInterval( function() {
  //     players.push(players.shift());
  //     io.to(gameId).emit('turnEnded', { players: players, duration: 1000} );
  //     alreadyPlayed = false;
  //   }, 1000);
  // }

  for (var i = 0; i < sockets.length; i++) {
    var socket = sockets[i];

    // socket.on('insert', function(event) {
    //   // -- FOR TURN IMPLEMENTATION -- //
    //   // if (players.length > 1) {
    //   //   if (event.state === players[0] && !alreadyPlayed) {
    //   //     alreadyPlayed = true;
    //   //     game.insert(event);
    //   //   }
    //   // } else {
    //     game.insert(event);
    //   // }
    // });

    socket.on('insert', insertListener);
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
      // clearInterval( intervalID2 ); <--- FOR TURN IMPLEMENTATION
      clearInterval( intervalID );
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
      sockets[i].removeListener('insert', insertListener);
      activeUsers[sockets[i].id].joined = false;
      sockets[i].leave(gameId);
    }

    delete playersInRoom[gameId];
    game = null;
    clearInterval( intervalID );
    // clearInterval( intervalID2 ); <--- FOR TURN IMPLEMENTATION
  });
};

module.exports.init = function(io, socket) {

  //Populate activeUsers object with connected socket IDs
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
  });

  socket.on('checkForUsers', function() {
    io.emit('updateUsers', activeUsers);
  });

  //When client sends leftGame event check if activeUsers joined property has the gameID
  // and that the game instance exists.  If so, remove to socket connection from the room.
  socket.on('leftGame', function() {
    if (activeUsers[this.id].joined && io.nsps['/'].adapter.rooms[activeUsers[this.id].joined]) {
      this.leave(activeUsers[this.id].joined);
      this.removeAllListeners('insert');
      io.to(this.id).emit('leaveGame');
      activeUsers[this.id].joined = false;
    }
  });

  //Remove socket id from activeUsers object on disconnect
  socket.on('disconnect', function(){
    delete activeUsers[this.id];
    io.emit('updateUsers', activeUsers);
  });

};
