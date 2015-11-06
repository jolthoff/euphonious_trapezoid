var router = angular.module('sphero.routes', ['angular-jwt']);


router.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('nav', {
      url: '/nav',
      templateUrl: 'nav/nav.html',
      controller: 'navController'
    })
    .state('profile', {
      url: '/profile',
      abstract: true,
      templateUrl: 'profile/profile.html',
      controller: 'profileController'
    })
    .state('profile.loading', {
      url: '/loading',
      params: { action: null, gameID: null },
      views: {
        'profile': {
          templateUrl: 'loading/loading.html',
          controller: 'loadingController'
        }
      },
      cache: false
    })
    .state('profile.launch', {
      url: '/launch',
      views: {
        'profile': {
          templateUrl: 'launch/launch.html',
          controller: 'launchController'
        }
      }
    })
    .state('profile.host', {
      url: '/host',
      views: {
        'profile': {
          templateUrl: 'host/host.html',
          controller: 'hostController'
        }
      }
    })
    .state('profile.game', {
      url: '/game',
      views: {
        'profile': {
          templateUrl: 'game/game.html',
          controller: 'gameController'
        }
      },
      cache: false
    })
    .state('profile.gameover', {
      url: '/gameover',
      views: {
        'profile': {
          templateUrl: 'endgame/endgame.html',
          controller: 'endgameController'
        }
      },
      cache: false
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/nav');

});

router.run(function($rootScope, $state, Auth) {
  $rootScope.$on('$locationChangeStart', function(event, next, current) {
    if (!localStorage.id_token && next.templateUrl !== '../nav/nav.html') {
      $state.go('nav');
    }
  });
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if (fromState.name === 'profile.game' && toState.name !== 'profile.gameover') {
      $rootScope.$broadcast('triggerLeave');
    }
  });
});

router.config(function Config($httpProvider, jwtInterceptorProvider) {
  jwtInterceptorProvider.tokenGetter = function() { //refactor to service for minification
    return localStorage.getItem('id_token');
  };

  $httpProvider.interceptors.push('jwtInterceptor');
});


// .factory('AttachTokens', function ($window) {
//   //this factory stops all outgoing requests, then looks in local storage
//   //for the user's JWT and adds the token to the request header
//   var attach = {
//     request: function (object) {
//       var jwt = $window.localStorage.getItem('sphero').token;
//       if (jwt) {
//         object.headers['x-access-token'] = jwt;
//       }
//       object.headers['Allow-Control-Allow-Origin'] = '*';
//       return object;
//     }
//   };
//   return attach;
// });
//.run(function($rootScope, $location, $state, Auth, Player){

//});
