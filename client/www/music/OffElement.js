window.AudioContext.prototype.createOffElement = function( ) {
  var context = this;
  var ms = Math.pow( 10, -3 );
  var element = {};
  element.master = context.createGain( );
  element.master.gain.value = 1;
  element.connect = function( destination ) {
    if( destination.hasOwnProperty( 'input' ) ) {
      element.master.connect( destination.input );
    } else {
      element.master.connect( destination );
    }
  };
  element.disconnect = function( ) {
    element.master.disconnect( );
  };
  element.start = function( when, midiNote, valence ) {
    var voice = {};
    voice.envelopes = [];
    voice.WN = context.createWhiteNoise( );
    voice.WNGain = context.createGain( );
    voice.WNGain.gain.value = 0;
    voice.WNGain.connect( element.master );
    // voice.WN.connect( voice.WNGain );
    // voice.WN.start( context.currentTime );
    voice.FMCarrier = context.createOscillator( );
    var fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    if( isNaN( fundamental ) ) {
      fundamental = 440;
    }
    voice.FMCarrier.frequency.value = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    voice.FMCarrier.type = 'sawtooth';
    voice.FMCarrier.start( context.currentTime );
    voice.FMCarrier.connect( voice.WNGain );
    voice.FMModulatorGain = context.createGain( );
    voice.FMModulatorGain.gain.value = 750;
    voice.FMModulatorGain.connect( voice.FMCarrier.frequency );
    voice.FMModulator = context.createWhiteNoise( );
    voice.FMModulator.connect( voice.FMModulatorGain );
    voice.FMModulator.start( context.currentTime );
    voice.WNGainEnv = {};
    voice.WNGainEnv.attack = {
      time: ( 5+ Math.random( ) * 10)* ms,
      target: 1,
      initial: 0
    };
    voice.WNGainEnv.decay = ( 5 + Math.random( ) * 10 ) * ms;
    voice.WNGainEnv.sustain = 0.1;
    voice.WNGainEnv.release = {
      time: ( 200 + valence * 100 / 8 ) * ms,
      target: 0
    };
    voice.WNGainEnv = context.createEnvelope(
      voice.WNGainEnv.attack,
      voice.WNGainEnv.decay,
      voice.WNGainEnv.sustain,
      voice.WNGainEnv.release
    );
    voice.envelopes.push( voice.WNGainEnv );
    voice.WNGainEnv.connect( voice.WNGain.gain );
    voice.sustain = 10 * ms;
    voice.envelopes.forEach( function( envelope ) {
      envelope.on( when, voice.sustain );
    });
    setTimeout( function( ) { // Disconnect everything in one second
      for( var key in voice ) {
        var node = voice[ key ];
        if( node instanceof AudioNode ) {
          node.disconnect( );
        }
        if( node instanceof OscillatorNode ) {
          node.stop( context.currentTime );
        } else if( typeof node.stop === 'function' ) {
          node.stop( context.currentTime );
        }
      }
    }, ( when - context.currentTime +
         voice.envelopes[ 0 ].attack.time +
         voice.envelopes[ 0 ].decay.time +
         voice.sustain +
         voice.envelopes[ 0 ].release.time ) * 1000 );
  };
  return element;
};