window.AudioContext.prototype.createPutElement = function( ) {
  var context = this;
  var ms = Math.pow( 10, -3 );
  var element = {};
  element.master = context.createGain( );
  element.master.gain.value = 0.25;
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
    while( midiNote < 24 ) {
      midiNote += 12;
    }
    var voice = {};
    voice.envelopes = [];
    voice.saw = context.createOscillator( );
    var fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    if( isNaN( fundamental ) ) {
      fundamental = 440;
    }
    voice.saw.frequency.value = fundamental;
    voice.saw.type = 'sawtooth';
    voice.saw.start( context. currentTime );
    voice.sawFilter = context.createBiquadFilter( );
    voice.sawFilter.frequency.value = 0;
    voice.sawFilter.type = 'lowpass';
    voice.sawFilter.gain.value = 0;
    voice.sawFilter.Q.value = 1;
    voice.saw.connect( voice.sawFilter );
    voice.sawFilter.connect( element.master );
    voice.sawFilterGainEnvelope = {};
    voice.sawFilterGainEnvelope.attack = {
      time: ( 1 + 14 * valence / 8) * ms,
      target: 1,
      initial: 0
    };
    voice.sawFilterGainEnvelope.decay = 0;
    voice.sawFilterGainEnvelope.sustain = 1;
    voice.sawFilterGainEnvelope.release = {
      time: 125 * ms,
      target: 0.1
    };
    voice.sawFilterGainEnvelope = context.createEnvelope(
      voice.sawFilterGainEnvelope.attack,
      voice.sawFilterGainEnvelope.decay,
      voice.sawFilterGainEnvelope.sustain,
      voice.sawFilterGainEnvelope.release
    );
    voice.envelopes.push( voice.sawFilterGainEnvelope );
    voice.sawFilterGainEnvelope.connect( voice.sawFilter.gain );
    voice.sawFilterFrequencyEnvelope = {};
    voice.sawFilterFrequencyEnvelope.attack = {
      time: voice.sawFilterGainEnvelope.attack.time,
      target: ( 1 + valence * 15 / 8 ) * fundamental,
      initial: 0
    };
    voice.sawFilterFrequencyEnvelope.decay = voice.sawFilterGainEnvelope.release.time;
    voice.sawFilterFrequencyEnvelope.sustain = 0.1;
    voice.sawFilterFrequencyEnvelope.release = {
      time: 10 * ms,
      target: 0
    };
    voice.sawFilterFrequencyEnvelope = context.createEnvelope(
      voice.sawFilterFrequencyEnvelope.attack,
      voice.sawFilterFrequencyEnvelope.decay,
      voice.sawFilterFrequencyEnvelope.sustain,
      voice.sawFilterFrequencyEnvelope.release
    );
    voice.envelopes.push( voice.sawFilterFrequencyEnvelope );
    voice.sawFilterFrequencyEnvelope.connect( voice.sawFilter.frequency );
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