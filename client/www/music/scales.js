sphero.factory('scales', function( ) {
  var scales = [];
  var createScale = function( notes, transpose ) {
    var scale;
    var i;
    var limit;
    if( transpose ) {
      limit = 12;
    } else {
      limit = 1;
    }
    for( i = 0; i < limit; i++ ) {
      scale = [];
      notes.forEach( function( note ) {
        scale.push( ( i + note ) % 12 );
      });
      scales.push( scale );
    }
  };
  // GREEK MODES
  // -----------
  // IONIAN
  createScale([0, 2, 4, 5, 7, 9, 11], true );
  // DORIAN
  createScale([0, 2, 3, 5, 7, 9, 10], true );
  // PHRYGIAN
  createScale([0, 1, 3, 5, 7, 8, 10], true );
  // LYDIAN
  createScale([0, 2, 4, 5, 7, 9, 10], true );
  // MIXOLYDIAN
  createScale([0, 2, 4, 6, 7, 9, 11], true );
  //AEOLIAN
  createScale([0, 2, 3, 5, 7, 8, 10], true );
  //LOCRIAN
  createScale([0, 1, 3, 5, 6, 8, 10], true );
  // -----------
  // ACOUSTIC SCALE
  createScale([0, 2, 4, 6, 7, 9, 10], true);
  // ALTERED SCALE
  createScale([1, 2, 4, 5, 7, 9, 11], true);
  // AUGMENTED SCALE
  createScale([0, 3, 4, 7, 8, 11], true);
  // BEBOP DOMINANT
  createScale([0, 2, 4, 5, 7, 9, 10, 11], true);
  // BLUES
  createScale([0, 3, 5, 6, 7, 10], true );
  // DOUBLE HARMONIC
  createScale([0, 1, 4, 5, 7, 8, 11], true);
  // ENIGMATIC
  createScale([0, 1, 4, 6, 8, 10, 11], true);
  // GYPSY
  createScale([0, 2, 3, 6, 7, 8, 11], true);
  // ISTRIAN
  createScale([0, 1, 3, 4, 6, 7], true);
  // IWATO
  createScale([0, 1, 5, 6, 10], true);
  // LYDIAN AUGMENTED
  createScale([0, 2, 4, 5, 8, 9, 11], true);
  // MAJOR BEBOP
  createScale([0, 2, 4, 5, 7, 8, 9, 11], true);
  // MAJOR LOCRIAN
  createScale([0, 2, 4, 5, 6, 8, 10], true);
  // MAJOR NEAPOLITAN
  createScale([0, 1, 3, 5, 7, 9, 11], true);
  // MINOR NEAPOLITAN
  createScale([0, 1, 3, 5, 7, 8, 11], true);
  // PERSIAN SCALE
  createScale([0, 1, 4, 5, 6, 8, 11], true);
  // PHRYGIAN DOMINANT
  createScale([0, 1, 4, 5, 7, 8, 10], true);
  // PROMETHEUS
  createScale([0, 2, 4, 6, 9, 10], true);
  // TRITONE
  createScale([0, 1, 4, 6, 7, 10], true);
  // WHOLE TONE
  createScale([0, 2, 4, 6, 8, 10], true);
  return scales;
});