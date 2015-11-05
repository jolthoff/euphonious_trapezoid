window.AudioContext.prototype.createDroneElement = function( midiNote ) {
  var element = {};
  var context = this;
  var fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
  if( isNaN( fundamental ) ) {
    fundamental = 440;
  }
  element.master = context.createGain( );
  element.master.gain.value = 0;
  element.note = midiNote;
  // Initialize the three oscillators
  var waves = [ 'triangle', 'square', 'sawtooth', 'sine' ];
  var filters = [ 'lowpass', 'highpass', 'bandpass' ];
  for( var i = 1; i <= 3; i++ ) {
    element[ 'filter' + i ] = context.createBiquadFilter( );
    element[ 'filter' + i ].frequency.value = fundamental * 1.5;
    element[ 'filter' + i ].type = 'lowpass';
    element[ 'filter' + i ].connect( element.master );
    element[ 'gain' + i ] = context.createGain( );
    element[ 'gain' + i ].gain.value = 1;
    element[ 'gain' + i ].connect( element[ 'filter' + i ] );
    element[ 'glfogain' + i ] = context.createGain( );
    element[ 'glfogain' + i ].gain.value = 0.1 + Math.random( ) * 0.2;
    element[ 'glfogain' + i ].connect( element[ 'gain' + i ].gain );
    element[ 'glfo' + i ] = context.createOscillator( );
    element[ 'glfo' + i ].frequency.value = 0.1 + Math.random( ) * 2.9;
    element[ 'glfo' + i ].type = 'sine';
    element[ 'glfo' + i ].start( context.currentTime );
    element[ 'glfo' + i ].connect( element[ 'glfogain' + i ] );
    element[ 'osc' + i ] = context.createOscillator( );
    element[ 'osc' + i ].frequency.value = fundamental;
    element[ 'osc' + i ].detune.value = Math.random( ) * 50 - 25;
    element[ 'osc' + i ].type = 'sine';
    element[ 'osc' + i ].start( context.currentTime );
    element[ 'osc' + i ].connect( element[ 'gain' + i ] );
  };
  element.rotate = function( when, midiNote ) {
    element.note = midiNote;
    fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    for( var i = 1; i <= 3; i++ ) {
      element[ 'osc' + i ].frequency.setTargetAtTime( fundamental, when, 0.25 );
      element[ 'filter' + i ].frequency.value = fundamental * 1.5;
    }
  };
  element.connect = function( destination ) {
    if( destination.hasOwnProperty( 'input' ) ) {
      element.master.connect( destination.input );
    } else {
      element.master.connect( destination );
    }
  };
  element.start = function( when ) {
    // Just come in slowly
    element.master.gain.setTargetAtTime( 0.35, when, 50 );
    // And then schedule changes on every parameter
    // but the oscillator frequencies every second
    element.playing = true;
    var schedule = function( ) {
      if( element.playing ) {
        setTimeout( schedule, 1000 );
      }
      for( var i = 1; i <= 3; i++ ) {
        var glfofreq = element[ 'glfo' + i ].frequency.value;
        glfofreq *= 1 + Math.random( ) * 3 - 0.15;
        if( glfofreq < 0.1 ) {
          glfofreq = 0.1;
        } else if( glfofreq > 4 ) {
          glfofreq = 4;
        }
        element[ 'glfo' + i ].frequency.setTargetAtTime( glfofreq, context.currentTime, 1 );
        var glfogain = element[ 'glfogain' + i ].gain.value;
        glfogain *= 1 + Math.random( ) * 0.3 - 0.15;
        if( glfogain <= 0.1 ) {
          glfogain = 0.1;
        } else if( glfogain > 0.3 ) {
          glfogain = 0.3;
        }
        element[ 'glfogain' + i ].gain.setTargetAtTime( glfogain, context.currentTime, 1 );
        var gain = element[ 'glfogain' + i ].gain.value;
        gain *= 1 + Math.random( ) * 1 - 0.5;
        if( gain <= 0.01 ) {
          gain = 0.01;
        } else if( gain > 1 ) {
          gain = 1;
        }
        element[ 'gain' + i ].gain.setTargetAtTime( gain, context.currentTime, 0.25 );
        var detune = Math.random( ) * 100 - 50;
        element[ 'osc' + i ].detune.setTargetAtTime( detune, context.currentTime, 0.25 );
      }
      var master = element.master.gain.value;
      master *= 1 + Math.random( ) * 1 - 0.5;
      if( master <= 0.01 ) {
        master = 0.01;
      } else if( master > 1 ) {
        master = 1;
      }
      if( !element.playing ) {
        master = 0;
      }
      element.master.gain.setTargetAtTime( master, context.currentTime, 0.25 );
    };
    schedule( );
  };
  element.stop = function( when ) {
    element.playing = false;
    element.master.gain.setTargetAtTime( 0, when, 2 );
    var intervalID = setInterval( function( ) {
      if( element.master.gain.value < 0.01 ) {
        for( var key in element ) {
          var node = element[ key ];
          if( node instanceof AudioNode ) {
            node.disconnect( );
          }
          if( node instanceof OscillatorNode ) {
            node.stop( when );
          }
        }
        element.master.disconnect( );
        clearInterval( intervalID );
      }
    }, 5000 );
  };
  return element;
};