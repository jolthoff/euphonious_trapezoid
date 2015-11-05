window.AudioContext.prototype.createSequenceElement = function( ) {
  var context = this;
  var ms = Math.pow( 10, -3 );
  var element = {};
  element.master = context.createGain( );
  element.master.gain.value = 0.5;
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
    midiNote = midiNote + Math.random() * 0.1 - 0.05;
    var fundamental = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
    if( isNaN( fundamental ) ) {
      fundamental = 440;
    }
    // Create and configure element.carrier
    voice.carrier = context.createOscillator();
    voice.carrier.frequency.value = 3 * fundamental;
    voice.carrier.type = 'sine';
    voice.carrier.start( context.currentTime );
    // Create and configure the voice.carrier.gain
    voice.carrierGain = context.createGain( );
    voice.carrierGain.gain.value = 0;
    voice.carrier.connect( voice.carrierGain );
    // Create and configure voice.sub
    voice.sub = context.createOscillator();
    voice.sub.frequency.value = 0.5 * fundamental;
    voice.sub.type = 'sine';
    voice.sub.start( context.currentTime );
    // Create and configure the voice.sub.gain
    voice.subGain = context.createGain( );
    voice.subGain.gain.value = 1;
    voice.sub.connect( voice.subGain );
    voice.subGain.connect( voice.carrierGain );
    voice.carrierGain.connect( element.master );
    // Create and configure voice.carrier.gain.envelope
    voice.carrierGainEnv = {};
    // Attack time is proportional to valence
    // Attack target is inversely proptional to valence
    voice.carrierGainEnv.attack = {
      time: 5 * ms,
      target: 1 / Math.pow( valence, 0.35 ),
      initial: 0
    };
    // Decay time is inversely proportional to valence
    voice.carrierGainEnv.decay = 20 * ms;
    // Sustain target is inversely proportional to valence
    voice.carrierGainEnv.sustain = 0.5 / Math.pow( valence, 0.35 );
    // Release target is always 0
    // Release time is directly proportional to valence
    voice.carrierGainEnv.release = {
      time: 10 * ms,
      target: 0
    };
    voice.carrierGainEnv = context.createEnvelope(
      voice.carrierGainEnv.attack,
      voice.carrierGainEnv.decay,
      voice.carrierGainEnv.sustain,
      voice.carrierGainEnv.release
    );
    voice.envelopes.push( voice.carrierGainEnv );
    voice.carrierGainEnv.connect( voice.carrierGain.gain );
    // Create and configure voice.carrier.modulator
    voice.modulator = context.createOscillator();
    voice.modulator.frequency.value = 1 * fundamental;
    voice.modulator.type = 'sine';
    voice.modulator.frequency.detune = -50;
    voice.modulator.start( context.currentTime );
    // Create and configure voice.modulator.gain
    voice.modulatorGain = context.createGain( );
    voice.modulatorGain.gain.value = 500;
    voice.modulatorGain.connect( voice.carrier.frequency );
    /*
      voice.carrier.modulator.gain <-- voice.carrier.modulator
    */
    voice.modulator.connect( voice.modulatorGain );
    // Create and congifure voice.carrier.modulator.gain.envelope
    voice.modulatorGainEnv = {};
    // The attack target is directly proportional to the valence
    voice.modulatorGainEnv.attack = {
      target: voice.modulatorGain.gain.value  + 4500 * Math.pow( valence, 2 ) / 64 * Math.random( ),
      time: voice.carrierGainEnv.attack.time + voice.carrierGainEnv.decay.time,
      initial: voice.modulatorGain.gain.value
    };
    voice.modulatorGainEnv.decay = 0;
    voice.modulatorGainEnv.sustain = voice.modulatorGainEnv.attack.target;
    voice.modulatorGainEnv.release = {
      time: voice.carrierGainEnv.release.time,
      target: voice.modulatorGain.gain.value
    };
    voice.modulatorGainEnv = context.createEnvelope(
      voice.modulatorGainEnv.attack,
      voice.modulatorGainEnv.decay,
      voice.modulatorGainEnv.sustain,
      voice.modulatorGainEnv.release
    );
    voice.envelopes.push( voice.modulatorGainEnv );
    voice.modulatorGainEnv.connect( voice.modulatorGain.gain );
    voice.sustain = 5 * ms;
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