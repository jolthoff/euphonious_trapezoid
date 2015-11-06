var rank = function( ) {
  // Returns an array that indicates
  // which player is winning the game.
  // This array contains the player
  // ids in descending order from
  // winner to loser.
  var scores = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0
  };
  this.board.forEach( function( sphere ) {
    if( sphere.state !== 'L' && sphere.state !== 'A' ) {
      scores[ sphere.state ]++;
    }
  });
  return ['0', '1', '2', '3'].sort( function( a, b ) {
    return scores[ b ] - scores[ a ];
  });
};
module.exports = rank;
