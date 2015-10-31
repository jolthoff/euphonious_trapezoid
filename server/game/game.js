var Board = require( './board.js' );
var EventEmitter = require( 'events' );
var get = require( './methods/get.js' );
var deletion = require( './methods/delete.js' );
var forNeighbors = require( './methods/forNeighbors.js' );
var place = require( './methods/place.js' );
var leafiness = require( './methods/leafiness.js' );
var updateLeaves = require( './methods/updateLeaves.js' );
var restore = require( './methods/restore.js' );
var put = require( './methods/put.js' );
var anchored = require( './methods/anchored.js' );
var detectChain = require( './methods/detectChain.js' );
var removeChain = require( './methods/removeChain.js' );
var rebalance = require( './methods/rebalance.js' );
var print = require( './methods/print.js' );
var insert = require( './methods/insert.js' );
var rank = require( './methods/rank.js' );
var getState = require( './methods/getState.js' );
var Game = function( ) {
  // Inherit from node's event emitter
  EventEmitter.call( this );
  // We use a board instead of a simple
  // collection of spheres to take advantage
  // of the board's get and place methods.
  this.board = new Board( );
  // Boards are initialized with the
  // the following pieces:
  //   L
  // L A L
  //   L
  // Each piece on the board has an id,
  // so it is convenient to keep track of
  // the next available id inside of the game.
  this.id = 1;
  // Therefore, the board is initialized
  // with four leaves at valence 0.
  // These four leaves are virtual leaves.
  // In truth, there is only one leaf and that
  // is the anchor. Nonetheless, it is more
  // intuitive to think of the anchor as four leaves,
  // not 1.
  this._leaves = [4];
  // We use the leaves getter method
  // to ensure that leaves aren't returned
  // with a set of trailing zeros.
  Object.defineProperty(
    this,
    'leaves',
    {
      get: function( ) {
        while( this._leaves[ this._leaves.length - 1 ] === 0 ) {
          this._leaves.pop( );
        }
        return this._leaves;
      }
    }
  );
  // We use maximumValence and minimumValence as a getter method
  // to avoid recalculating the maximum valence and the minimum valence
  // on every call to put.
  Object.defineProperty(
    this,
    'maximumValence',
    {
      get: function( ) {
        return this.leaves.length - 1;
      }
    }
  );
  Object.defineProperty(
    this,
    'minimumValence',
    {
      get: function( ) {
        var leaves = this.leaves;
        for( var i = 0; i < leaves.length; i++ ) {
          if( leaves[ i ] !== 0 ) {
            return i;
          }
        }
      }
    }
  );
  // We use balanced as a getter method
  // to determine dynamically whether a tree is staged to be
  // rebalanced. To fine tune rebalancing behavior,
  // change the number inside of the get function.
  Object.defineProperty(
    this,
    'balanced',
    {
      get: function( ) {
        return this.maximumValence <= this.minimumValence + 3;
      }
    }
  );
  Object.defineProperty(
    this,
    'ended',
    {
      get: function( ) {
        return this.maximumValence >= 8;
      }
    }
  );
  // Change the chainThreshold to fine tune
  // chain removal behavior. If the chainThreshold
  // is 4, then chains of 5 spheres with the same state
  // will get removed.
  this.chainThreshold = 2;
};
Game.prototype = Object.create( EventEmitter.prototype );
Game.prototype.get = get;
Game.prototype.delete = deletion;
Game.prototype.forNeighbors = forNeighbors;
Game.prototype.place = place;
Game.prototype.leafiness = leafiness;
Game.prototype.updateLeaves = updateLeaves;
Game.prototype.restore = restore;
Game.prototype.put = put;
Game.prototype.anchored = anchored;
Game.prototype.detectChain = detectChain;
Game.prototype.removeChain = removeChain;
Game.prototype.rebalance = rebalance;
Game.prototype.print = print;
Game.prototype.insert = insert;
Game.prototype.rank = rank;
Game.prototype.getState = getState;
module.exports = Game;