window.AudioContext.prototype.createFellElement = function( ) {
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
    while( midiNote < 36 ) {
      midiNote += 12;
    }
    var fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    if( isNaN( fundamental ) ) {
      fundamental = 440;
    }
    var voice = {};
    voice.envelopes = [];
    voice.sine = context.createOscillator( );
    voice.sine.type = 'sine';
    voice.sine.frequency.value = fundamental * 4;
    voice.sine.start( context.currentTime );
    voice.sineGain = context.createGain( );
    voice.sineGain.gain.value = 0;
    voice.sine.connect( voice.sineGain );
    voice.filter = context.createBiquadFilter( );
    voice.filter.type = 'highpass';
    voice.filter.frequency.value = fundamental * 4;
    voice.sineGain.connect( voice.filter );
    voice.filter.connect( element.master );
    voice.sineFreqEnv = {};
    voice.sineFreqEnv.attack = {
      time: ( 1 + valence * 30 / 8 + Math.random( ) * 1 ) * ms,
      target: fundamental * 8,
      initial: fundamental * 2
    };
    voice.sineFreqEnv.decay = 125 * ms - voice.sineFreqEnv.attack.time;
    voice.sineFreqEnv.sustain = 0;
    voice.sineFreqEnv.release = {
      time: 1 * ms,
      target: 0
    };
    voice.sineFreqEnv = context.createEnvelope(
      voice.sineFreqEnv.attack,
      voice.sineFreqEnv.decay,
      voice.sineFreqEnv.sustain,
      voice.sineFreqEnv.release
    );
    voice.envelopes.push( voice.sineFreqEnv );
    voice.sineFreqEnv.connect( voice.sine.frequency );
    voice.sineGainEnv = {};
    voice.sineGainEnv.attack = {
      time: 40 * ms,
      target: 1,
      initial: 0
    };
    voice.sineGainEnv.decay = 125 * ms - voice.sineGainEnv.attack.time;
    voice.sineGainEnv.sustain = 0;
    voice.sineGainEnv.release = {
      time: 1 * ms,
      target: 0
    };
    voice.sineGainEnv = context.createEnvelope(
      voice.sineGainEnv.attack,
      voice.sineGainEnv.decay,
      voice.sineGainEnv.sustain,
      voice.sineGainEnv.release
    );
    voice.envelopes.push( voice.sineGainEnv );
    voice.sineGainEnv.connect( voice.sineGain.gain );
    voice.sustain = 20 * ms;
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