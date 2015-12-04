angular.module('starter.controllers')

.controller('PinCtrl', function(AuthService, $scope, $state, $location, $timeout, $rootScope, pins, AccountsSrv, globals) {

    window.scope = $scope;

    $scope.add = add;
    $scope.del = del;
    $scope.passcode = '';
    $scope.username = false;

    activate();

    ///////////

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
        setTimeout(function() {
            $scope.username = AuthService.getUsername();
        }, 500);
    }

});

