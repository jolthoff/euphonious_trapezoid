sphero.controller('navController', ['$scope', '$window', 'Auth', '$state', 'player', '$ionicPopup',
  function($scope, $window, Auth, $state, player, $ionicPopup) {

    $scope.loginStatus = false;
    $scope.logoutStatus = true;
    $scope.loaded = false;

    $scope.single = function() {
      $state.go('loading', {action: 'single'});
    };


    $scope.signUp = function(username, password, email) {
      console.log("username: ", username, "password: ", password, "email: ", email);
      Auth.signUp(username, password, email)
        .then(function() {
          $scope.login(username, password);
        }, function(err) {
          console.log(err);
          //handle error
        });
    };

    $scope.showPopup = function() {
      $scope.signupInfo = {};
      var signupPopUp = $ionicPopup.show({
        template: '<form class="list"><label class="item item-input"><input type="text" placeholder="Username" ng-model="signupInfo.username"></label><label class="item item-input"><input type="text" placeholder="Password" ng-model="signupInfo.password"></label><label class="item item-input" id="email"><input type="text" placeholder="Email" ng-model="signupInfo.email"></label></form>',
        title: 'Enter User info',
        scope: $scope,
        buttons: [{
          text: 'Cancel',
          type: 'button-clear',
          onTap: function(e) {
            return false;
          }
        }, {
          text: '<b>Submit</b>',
          type: 'button-clear',
          onTap: function(e) {
            console.log($scope.signupInfo.username);
            if ($scope.signupInfo.username === undefined || $scope.signupInfo.username === null) {
              console.log('none entered');
              //don't allow the user to close unless he enters proper credentials
              e.preventDefault();
            } else {
              return $scope.signupInfo;
            }
          }
        }, ]
      });

      signupPopUp.then(function(playerInfo) {
        signupPopUp.close();
        if (playerInfo) {
          $scope.signUp(playerInfo.username, playerInfo.password, playerInfo.email);
        }
      });
    };

    $scope.login = function(username, password) {
      console.log(username);
      Auth.login(username, password)
        .then(function(user) {
          if (user) {
            player.profile = user.profile;
            $window.localStorage.setItem('id_token', user.token);
            $scope.logoutStatus = !Auth.checkAuth();
            setTimeout(function() {
              $scope.loginStatus = Auth.checkAuth();
            }, 250);
          } else {
            alert('Invalid login, please login or signup');
          }
        });
    };

    $scope.logout = function() {
      Auth.destroyCredentials();
      $scope.loginStatus = false;
      setTimeout(function() {
        $scope.logoutStatus = true;
      }, 250);
    };

    $scope.load = function() {
      if ($window.localStorage.getItem('id_token')) {
        Auth.loadAuth($window.localStorage.getItem('id_token'));
        $scope.logoutStatus = false;
        // setTimeout(function() {
        $scope.loginStatus = true;
        // }, 250);
        $scope.loaded = true;
      } else {
        $scope.loaded = true;
      }
    };
    // will change the above auth check to be server-side later and integrate promises

    $scope.load();


  }
]);
