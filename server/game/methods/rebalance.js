var Board = require( '../board.js' );
var rebalance = function( ) {
  var suspend = function( x, y ) {
    // Suspend is intended to emit an
    // event that tells the client to
    // move the ball in the z-direction,
    // so as to collisions of models.
    // To avoid adding complexity to the sphere
    // model, the suspension in the server-side
    // board is represented by modifying the
    // sphere to be a liberty.
    var sphere = this.get( x,  y );
    var event = {
      coordinates: {
        x: sphere.coordinates.x,
        y: sphere.coordinates.y
      },
      state: sphere.state,
      valence: sphere.valence,
      id: sphere.id,
      success: true
    };
    var copy = sphere.copy( );
    sphere.state = 'L';
    this.emit( 'suspended', event );
    return copy;
  }.bind( this );

  var findClosestLiberty = function( coordinates ) {

    var liberty;

    this.board.forEach(function(sphere) {
      if (sphere.state === 'L') {
        if (!liberty) {
          liberty = sphere
        } else if (sphere.coordinates.x !== coordinates.x ||
          sphere.coordinates.y !== coordinates.y ) {
          var sphereDistance = Math.abs(sphere.coordinates.x - coordinates.x) +
          Math.abs(sphere.coordinates.y - coordinates.y);
          var libertyDistance = Math.abs(liberty.coordinates.x - coordinates.x) +
          Math.abs(liberty.coordinates.y - coordinates.y);

          if (libertyDistance > sphereDistance) {
            liberty = sphere;
          }

        }

      }
    });

    return liberty;

  }.bind(this);

  // var findClosestLiberty = function( coordinates, valence, ignore ) {
  //   // This is for the fallers. It is the function
  //   // used to figure out where the pieces that did
  //   // not rotate with the rest of the board because
  //   // their valence was too large will fall.
  //   if( coordinates.x === 0 && coordinates.y === 0 ) {
  //     // This is the base case. If the function reached
  //     // the anchor in search of a closest liberty toward
  //     // the center, this means that said branch
  //     // of the search algorithm did not yield a plausible
  //     // solution. We return false so that the algorithm knows
  //     // to explore other branches.
  //     return false;
  //   }
  //   // Ignore is the array of coordinates, as x:y strings, that holds
  //   // all of the visited coordinates in this branch of the algorithm.
  //   ignore = ignore || [];
  //   var liberty;
  //   this.forNeighbors( coordinates.x, coordinates.y, function( neighbor, coordinates ) {
  //     // In case one of the neighbors is a liberty with a valence smaller
  //     // than the valence of the piece that is falling, then that neighbor
  //     // is the closest liberty only if it should not be ignored.
  //     if( neighbor && neighbor.state === 'L' ) {
  //       if( ignore.indexOf( coordinates.x + ':' + coordinates.y ) < 0 ) {
  //         liberty = neighbor;
  //       }
  //     }
  //   }.bind( this ));
  //   // In the case that one of the neighbors
  //   // was the closest liberty, we simply return
  //   // that liberty.
  //   if( liberty ) {
  //     return liberty;
  //   }
  //   // Paths is an array of all the coordinates
  //   // through which the function can continue
  //   // searching for a liberty.
  //   var paths = [];
  //   this.forNeighbors( coordinates.x, coordinates.y, function( neighbor, coordinates ) {
  //     paths.push( coordinates );
  //   });
  //   // Paths is sorted in order of distance from
  //   // the anchor so as to prefer paths that yield
  //   // liberties closer to the center.
  //   paths.sort( function( aCoordinates, theCoordinates ) {
  //     return Math.abs( aCoordinates.x ) + Math.abs( aCoordinates.y ) -
  //       Math.abs( theCoordinates.x ) - Math.abs( theCoordinates.y );
  //   });
  //   // Because we didn't find a liberty above, we search
  //   // for liberties in paths starting at each of
  //   // the coordinates in paths.
  //   // The loop is broken and a liberty
  //   // is returned only if a liberty is found.
  //   ignore.push( coordinates );
  //   for( var i = 0; i < paths.length; i++ ) {
  //     var path = paths[ i ];
  //     if (ignore.indexOf(path.x + ':' + path.y) < 0) {
  //       liberty = findClosestLiberty( path, valence, ignore );
  //       if( liberty ) {
  //         return liberty;
  //       }
  //     }
  //   }
  //   // If no paths were found, this is
  //   // because for every possible path
  //   // starting at the coordinates in paths,
  //   // there is no available liberty.
  //   // Presumably, liberty is false.
  //   return liberty;
  // }.bind( this );
  // There are two types of spheres on an unbalanced
  // board. Fallers are the pieces with a valence
  // greater than the threshold, and rotators are
  // the pieces with a valence less than the threshold.
  var fallers = [];
  var rotators = [];
  var event = {};
  event.rotators = [];
  var threshold = this.maximumValence - 2;
  // We find all of the fallers and remove them from the board.
  this.board.forEach( function( sphere ) {
    if( sphere.state !== 'L' && sphere.valence > threshold ) {
      fallers.push( suspend( sphere.coordinates.x, sphere.coordinates.y ) );
    }
  }.bind( this ));
  // We sort the fallers by ascending valence.
  fallers = fallers.sort( function( aSphere, theSphere ) {
    return aSphere.valence - theSphere.valence;
  });
  // All pieces left on the board that are not
  // liberties are rotators.
  this.board.forEach( function( sphere ) {
    if( sphere.state !== 'L' && sphere.state !== 'A' ) {
      rotators.push( sphere.copy( ) );
    }
  }.bind( this ));
  // We sort the rotators by ascending valence
  rotators = rotators.sort( function( aSphere, theSphere ) {
    return aSphere.valence - theSphere.valence;
  });
  // We get rid of the old board and create a blank slate.
  this.board = new Board( );
  this._leaves = [4];
  // Because the rotators are sorted by ascending valence,
  // it's safe to put them on the new board using the game's
  // put method.
  for( var i = 0; i < rotators.length; i++ ) {
    var sphere = rotators[ i ];
    if( this.put( -sphere.coordinates.y, sphere.coordinates.x, sphere.state ) ) {
      this.get( -sphere.coordinates.y, sphere.coordinates.x ).id = sphere.id;
      event.rotators.push({
        to: {
          x: -sphere.coordinates.y,
          y: sphere.coordinates.x
        },
        from: {
          x: sphere.coordinates.x,
          y: sphere.coordinates.y
        },
        state: sphere.state,
        valence: sphere.valence,
        id: sphere.id,
        success: true
      });
    }
  }
  event.rotators = event.rotators.sort(function(a, the) {
    return a.id - the.id;
  });
  event.valenceMinMax = [this.minimumValence, this.maximumValence];
  this.emit( 'rotated', event );
  // We use find closest liberty to replace all of the
  // fallers on the new, rotated board. In case that on
  // any of these movements a chain is created, that chain
  // is destroyed before the rest of the fallers fall.
  fallers.forEach( function( sphere ) {
    var liberty = findClosestLiberty( sphere.coordinates );
    this.put( liberty.coordinates.x, liberty.coordinates.y, sphere.state );
    this.get( liberty.coordinates.x, liberty.coordinates.y ).id = sphere.id;
    event = {
      to: {
        x: liberty.coordinates.x,
        y: liberty.coordinates.y
      },
      from: {
        x: sphere.coordinates.x,
        y: sphere.coordinates.y
      },
      valence: sphere.valence,
      id: sphere.id,
      state: sphere.state,
      success: true
    };
    event.valenceMinMax = [this.minimumValence, this.maximumValence];
    this.emit( 'fell', event );
    var chain = this.detectChain( liberty.coordinates.x, liberty.coordinates.y );
    if( chain.remove ) {
      this.removeChain( chain.chain );
    }
  }.bind( this ));
  // In case that, by chain removal,
  // the board resulting from the rebalance
  // is still not balanced, we rebalance.
  // This process will not cause for an infinite
  // recursive loop because the board that
  // contains the anchor and its four liberties
  // is balanced.
  if( !this.balanced ) {
    this.rebalance( );
  }
};
module.exports = rebalance;
