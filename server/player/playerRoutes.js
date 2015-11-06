var playerController = require('./playerCntrl');

//links controller methods to respective routes
module.exports = function(router) {

  router.post('/signup', playerController.signup);
  router.post('/friend', playerController.friend);
  router.post('/profile', playerController.updateProfile);

};
