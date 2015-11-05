AudioContext.prototype.createIndicatorElement = function( ) {
  /*
    GRAPH:

    anchor.sub --> anchor.sub.firstGain --> anchor.sub.secondGain --> anchor.master --> destination
        ^                ^                      ^
        |                |                      |
        .frequency       .gain                  .gain
        ^                ^                      ^
        |                |                      |
        |                |                      * <-- anchor.sub.secondGain.envelope
        |                |
        |                * <-- anchor.sub.firstGain.whiteNoise.gain *
        |                                                         ^
        |                                                         |
        |                                                         * <-- anchor.sub.firstGain.whiteNoise
        |
        * <-- anchor.subFEnv
  */
  var context = this;
  var ms = Math.pow( 10, -3 );
  // midiNote defaults to C2
  var midiNote = 24;
  var anchor = {};
  anchor.envelopes = [];
  anchor.master = context.createGain( );
  anchor.master.gain.value = 0.75;
  anchor.sustain = 50 * ms;
  anchor.connect = function( destination ) {
    if( destination.hasOwnProperty( 'input' ) ) {
      anchor.master.connect( destination.input );
    } else {
      anchor.master.connect( destination );
    }
  };
  anchor.disconnect = function( when ) {
    for( var key in anchor ) {
      var node = anchor[ key ];
      if( node instanceof AudioNode ) {
        node.disconnect( );
      }
      if( node instanceof OscillatorNode ) {
        node.stop( when );
      } else if( typeof node.stop === 'function' ) {
        node.stop( when );
      }
    }
  };
  anchor.start = function( when ) {
    anchor.envelopes.forEach( function( envelope ) {
      envelope.on( when, anchor.sustain );
    });
  };
  anchor.sub = context.createOscillator( );
  anchor.sub.type = 'sine';
  anchor.sub.frequency.value = 440 * Math.pow( 2, ( midiNote - 12 - 69 ) / 12 );
  anchor.sub.start( context.currentTime );
  // Create anchor.subFEnv
  anchor.subFEnv = {};
  anchor.subFEnv.attack = {
    time: 1 * ms,
    target: 440 * Math.pow( 2, ( midiNote + 24 - 69 ) / 12 ),
    initial: 440 * Math.pow( 2, ( midiNote + 22 - 69 ) / 12 )
  };
  anchor.subFEnv.decay =  74 * ms;
  anchor.subFEnv.sustain = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );
  anchor.subFEnv.release = {
    time: 25 * ms,
    target: 440 * Math.pow( 2, ( midiNote - 12 - 69 ) / 12 )
  };
  anchor.subFEnv = context.createEnvelope(
    anchor.subFEnv.attack,
    anchor.subFEnv.decay,
    anchor.subFEnv.sustain,
    anchor.subFEnv.release
  );
  anchor.envelopes.push( anchor.subFEnv );
  anchor.subFEnv.connect( anchor.sub.frequency );
  // Create and configure anchor.subGain1
  anchor.subGain1 = context.createGain( );
  anchor.subGain1.gain.value = 1;
  anchor.sub.connect( anchor.subGain1 );
  // Create and configure anchor.subGain1WN
  anchor.subGain1WN = context.createWhiteNoise( );
  // Create and configure anchor.subGain1WNGain
  anchor.subGain1WNGain = context.createGain( );
  anchor.subGain1WNGain.gain.value = 0.0005;
  anchor.subGain1WN.connect( anchor.subGain1WNGain );
  anchor.subGain1WN.start( context.currentTime );
  anchor.subGain1WNGain.connect( anchor.subGain1.gain );
  // Create and configure anchor.subGain2
  anchor.subGain2 = context.createGain( );
  anchor.subGain2.gain.value = 0;
  anchor.subGain1.connect( anchor.subGain2 );
  anchor.subGain2.connect( anchor.master );
  // Create and configure anchor.subGain2Env
  anchor.subGain2Env = {};
  anchor.subGain2Env.attack = 1 * ms;
  anchor.subGain2Env.decay = 74 * ms;
  anchor.subGain2Env.sustain = 0.25;
  anchor.subGain2Env.release = 25 * ms;
  anchor.subGain2Env = context.createEnvelope(
    anchor.subGain2Env.attack,
    anchor.subGain2Env.decay,
    anchor.subGain2Env.sustain,
    anchor.subGain2Env.release
  );
  anchor.envelopes.push( anchor.subGain2Env );
  anchor.subGain2Env.connect( anchor.subGain2.gain );
  // Done
  return anchor;
};