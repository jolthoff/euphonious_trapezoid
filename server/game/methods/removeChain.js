var removeChain = function( chain ) {
  var reanchor = function( anchored ) {
    // If any of the neighbors is not anchored, then we move
    // that neighbor into some coordinates that we
    // know to be anchored. Otherwise, if some of the neighbors
    // are liberties, we delete them. This may seem unsafe,
    // but keep in mind that if the removed liberties should
    // not have been removed, they will be reintroduced
    // by the move function.
    this.forNeighbors( anchored.x, anchored.y, function( neighbor, coordinates ) {
      if( neighbor && !this.anchored( coordinates.x, coordinates.y ) ) {
        if( neighbor.state === 'L' ) {
          this.delete( coordinates.x, coordinates.y );
        } else if( neighbor ) {
          move( anchored, coordinates );
        }
      }
    }.bind( this ));
  }.bind( this );
  var move = function( to, from ) {
    // We move the sphere at the from
    // coordinates to the to coordinates,
    // ensuring that the leaves array
    // is updated appropriately.
    var event = {
      to: to,
      from: from
    };
    from = this.get( from.x, from.y );
    event.state = from.state;
    from.state = 'L';
    from = from.coordinates;
    this.updateLeaves( from.x, from.y );
    this.put( to.x, to.y, event.state );
    this.get( to.x, to.y ).id = this.get( from.x, from.y ).id;
    event.success = true;
    event.id = this.get( to.x, to.y ).id;
    event.valence = this.get( to.x, to.y ).valence;
    this.emit( 'moved', event );
    reanchor( from );
  }.bind( this );
  var remove = function( x, y ) {
    // This remove method takes a sphere off
    // the board and drags the chain of all
    // the sphere's whose anchoring depended on
    // this sphere into the sphere's coordinates.
    var sphere = this.get( x, y );
    var event = {
      coordinates: {
        x: x,
        y: y
      },
      state: sphere.state,
      valence: sphere.valence,
      id: sphere.id
    };
    sphere.state = 'L';
    // Update the leaves array to reflect that
    // a sphere has been removed.
    this.updateLeaves( x, y );
    if( sphere.valence === 1 ){
      this.leaves[ 0 ] += 1;
    }
    // At this point the piece has been
    // removed.
    event.success = true;
    event.valenceMinMax = [this.minimumValence, this.maximumValence];
    this.emit( 'removed', event );
    // Reanchor is the function that drags
    // the possibly unanchored pieces into
    // the coordinates of the removed piece.
    reanchor( { x: x, y: y } );
    // In some cases, removing one chain may
    // create another chain in the process.
    // Therefore, it may be necessary to
    // remove chains in cascade.
    cascade = this.detectChain( x, y );
    cascade.should = !( this.get( x, y ).state === event.state ) && cascade.remove;
    if( cascade.should ) {
      this.removeChain( cascade.chain );
    }
  }.bind( this );
  // Removing the chain consists in
  // removing each sphere that makes up the
  // chain.
  var state = this.get(chain[0].x, chain[0].y).state
  chain.forEach( function( coordinates ) {
    var sphere = this.get(coordinates.x, coordinates.y);
    if (sphere && sphere.state === state) {
      remove( coordinates.x, coordinates.y );
    }
  }.bind( this ));
};
module.exports = removeChain;