sphero.factory( 'findChords', function( ) {
  return function( scale ) {
    // use scale to produce an array with all the    
    // midi notes from that scale between 36 and 84    
    var notes = [];
    for( var i = 48; i < 84; i += 12 ) {
      for( var j = 0; j < scale.length; j++ ) {
        notes.push( scale[ j ] + i );
      }
    }
    // Then choose all 8 note patterns that don't    
    // choose two notes that are less than 2 indices apart   
    // in the notes array    
    var chords = []
    for( var i = ( 1 << 8 ) - 1; i < ( 1 << ( notes.length ) ) - 1; i++ ) {
      var chord = [];
      for( var j = 0; j < notes.length; j++ ) {
        if( ( i >> j ) % 2 === 1 ) {
          if( j > 1 ) {
            if( ( i >> j - 1 ) % 2 === 0 &&
                ( i >> j + 1 ) % 2 === 0 ) {
              chord.push( notes[ j ] );
            }
          } else {
            if( ( i >> j + 1 ) % 2 === 0 ) {
              chord.push( notes[ j ] );
            }
          }
        }
      }
      if( chord.length === 8 ) {
        chords.push( chord );
      }
    }
    return chords;
  };
});