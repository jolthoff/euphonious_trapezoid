window.AudioContext.prototype.createMovedElement = function( ) {
  var context = this;
  var ms = Math.pow( 10, -3 );
  var element = {};
  element.master = context.createGain( );
  element.master.gain.value = 0.35;
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
    voice.sine.frequency.value = fundamental;
    voice.sine.start( context.currentTime );
    voice.LFO = context.createOscillator( );
    voice.LFO.type = 'sine';
    voice.LFO.frequency.value = 0;
    voice.LFO.start( context.currentTime );
    voice.LFOGain = context.createGain( );
    voice.LFOGain.gain.value = 0;
    voice.LFOGain.connect( voice.sine.frequency );
    voice.LFO.connect( voice.LFOGain );
    voice.LFOFrequencyEnvelope = {};
    voice.LFOFrequencyEnvelope.attack = {
      time: 75 * ms,
      target: 5 + valence * 10 / 8,
      initial: 0
    };
    voice.LFOFrequencyEnvelope.decay = 0;
    voice.LFOFrequencyEnvelope.sustain = voice.LFOFrequencyEnvelope.attack.target;
    voice.LFOFrequencyEnvelope.release = {
      time: 30 * ms,
      target: 0
    };
    voice.LFOFrequencyEnvelope = context.createEnvelope(
      voice.LFOFrequencyEnvelope.attack,
      voice.LFOFrequencyEnvelope.decay,
      voice.LFOFrequencyEnvelope.sustain,
      voice.LFOFrequencyEnvelope.release
    );
    voice.envelopes.push( voice.LFOFrequencyEnvelope );
    voice.LFOFrequencyEnvelope.connect( voice.LFO.frequency );
    voice.LFOGainEnvelope = {};
    voice.LFOGainEnvelope.attack = {
      time: 75 * ms,
      target: fundamental * Math.pow( 2, 2 / 12 ) - fundamental,
      initial: 0
    };
    voice.LFOGainEnvelope.decay = 0;
    voice.LFOGainEnvelope.sustain = voice.LFOGainEnvelope.attack.target;
    voice.LFOGainEnvelope.release = {
      time: 30 * ms,
      target: 0
    };
    voice.LFOGainEnvelope = context.createEnvelope(
      voice.LFOGainEnvelope.attack,
      voice.LFOGainEnvelope.decay,
      voice.LFOGainEnvelope.sustain,
      voice.LFOGainEnvelope.release
    );
    voice.envelopes.push( voice.LFOGainEnvelope );
    voice.LFOGainEnvelope.connect( voice.LFOGain.gain );
    voice.sineGain = context.createGain( );
    voice.sineGain.gain = 0;
    voice.sine.connect( voice.sineGain );
    voice.sineGain.connect( element.master );
    voice.sineGainEnvelope = {};
    voice.sineGainEnvelope.attack = {
      time: 1 * ms,
      target: 1,
      initial: 0
    };
    voice.sineGainEnvelope.decay = 0;
    voice.sineGainEnvelope.sustain = voice.sineGainEnvelope.attack.target;
    voice.sineGainEnvelope.release = {
      time: 105 * ms - voice.sineGainEnvelope.attack.time,
      target: 0
    };
    voice.sineGainEnvelope = context.createEnvelope(
      voice.sineGainEnvelope.attack,
      voice.sineGainEnvelope.decay,
      voice.sineGainEnvelope.sustain,
      voice.sineGainEnvelope.release
    );
    voice.envelopes.push( voice.sineGainEnvelope );
    voice.sineGainEnvelope.connect( voice.sineGain.gain );
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