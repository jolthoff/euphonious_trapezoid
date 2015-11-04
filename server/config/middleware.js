var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var FacebookStrategy = require('passport-facebook').Strategy;
var morgan = require('morgan');
var passport = require('passport');


module.exports = function(app, express) {
  //Serve up static files in client folder and other middleware
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));

  var FACEBOOK_APP_ID = "--insert-facebook-app-id-here--"
  var FACEBOOK_APP_SECRET = "--insert-facebook-app-secret-here--";

  //serve static files (Sphero homepage)
  app.use(express.static(__dirname + '/../../static'));

  //set up express router instances
  var authRouter = express.Router();
  var playerRouter = express.Router();

  //set response headers
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Authorization, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });


  app.use(function(req, res, next) {
    console.log('===================='); //to sep dev logs in terminal
    next();
  });

  //routes to spheroAPI are restricted routes
  app.use('/spheroAPI', expressJwt({
    secret: 'flashing kittens love 25% cotton!'
  }));

  //route request to specific router and inject into specific route file

  app.use('/auth', authRouter); // might inject this to use in players instead
  require('../auth/authRoutes')(authRouter);


  app.use('/player', playerRouter);
  require('../player/playerRoutes')(playerRouter);



};
