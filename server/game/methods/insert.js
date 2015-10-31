var insert = function( event ) {
  // We expect event to have the following form
  var coordinates = event.coordinates;
  var state = event.state;
  // Insert, unlike put or place, emits events, removes chains,
  // and rebalances each time it puts a piece on the board.
  // 'put' events are triggered here instead of inside
  // the put method so that the put method can be
  // used in other methods where it's not desirable
  // to trigger a 'put' event.
  // For all practical purposes, insert is the method
  // through which the client will manipulate the board's state.
  if( this.put( coordinates.x, coordinates.y, state ) ) {
    var sphere = this.get( coordinates.x, coordinates.y );
    sphere.id = this.id++;
    event.success = true;
    event.id = sphere.id;
    event.valence = sphere.valence;
    event.valenceMinMax = [this.minimumValence, this.maximumValence];
    this.emit( 'put', event );
    var chain = this.detectChain( coordinates.x, coordinates.y );
    if( chain.remove ) {
      this.removeChain( chain.chain );
    }
    if( !this.balanced ) {
      this.rebalance( );
    }
  } else {
    event.success = false;
    event.valenceMinMax = [this.minimumValence, this.maximumValence];
    this.emit( 'put', event );
  }

  if( this.ended ) {
    this.emit( 'ended' );
  } else {
    this.emit( 'state', this.getState());
  }
};
module.exports = insert;