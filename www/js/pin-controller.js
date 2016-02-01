angular.module('starter.controllers')

.controller('PinCtrl', function($ionicPopup, AuthService, $scope, $state, $location, $timeout, $rootScope, pins, AccountsSrv, globals) {

    window.scope = $scope;

    $scope.add = add;
    $scope.del = del;
    $scope.passcode = '';
    $scope.username = false;
    var AUTH_KEY = 'gjusername';

    activate();

    ///////////

// Triggered on a button click, or some other target
$scope.getUsername = function() {
  $scope.data = {username: $scope.username};

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="text" class="username" ng-model="data.username">',
    title: 'Enter your username',
    subTitle: '(Supplied by GJ Services)',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.username) {
            //don't allow the user to close unless he enters username
            e.preventDefault();
          } else {
            return $scope.data.username;
          }
        }
      }
    ]
  });

  myPopup.then(function(res) {
    console.log('Tapped!', res);
    $scope.username = res;
    return res;
  });

 };

    function restoreState() {
        $scope.username = window.localStorage[AUTH_KEY] || '';
    }

    function add(value) {
        if ($scope.passcode.length < 4) {
            $scope.passcode = $scope.passcode + value;
            if ($scope.passcode.length == 4) {
                login();
            }
        }
    }

    function login() {
        $timeout(function() {
            if (!$scope.passcode || !$scope.username) {
                alert('PIN not recognised');
                $scope.passcode = '';
                $state.reload();
            } else {
                AuthService.login($scope.username, $scope.passcode).then(function() {
                    $state.go(AuthService.role() == 'admin' ? 'sitesadmin' : 'sites');
                }, function() {
                    $scope.passcode = '';
                    $state.reload();
                });
            }
        }, 200);

    }

    function del() {
        if ($scope.passcode.length > 0) {
            $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
        }
    }

    function activate() {
        restoreState();
        setTimeout(function() {
            //$scope.username = AuthService.getUsername();
            $scope.username = $scope.getUsername();
        }, 500);
    }

});

