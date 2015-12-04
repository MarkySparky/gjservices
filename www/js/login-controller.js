angular.module('starter')

.controller('LoginCtrl', function($scope, $rootScope, $state, $rootScope, globals, AccountsSrv, $cordovaPinDialog) {
    //https://docs.google.com/spreadsheets/d/1jFzrJxeumJusopmoXyGntEkSFtUR1zOqtblXEdCLVgA/pub?gid=0&single=true&output=csv

    window.scope = $scope;

    $scope.user = '';

    $scope.login = login;

    activate();

    ///////

    function login() {

        $rootScope.loggedIn = false;

        if (!$scope.user || !$scope.pin) {
            alert('Must enter a username and PIN code');
            return false;
        } else if ($scope.pin != $rootScope.pin && $scope.pin != $rootScope.adminPin) {
            alert('Wrong PIN code, try again');
            return false;
        } else {
            $rootScope.loggedIn = true;
            $rootScope.isAdmin = (+$scope.pin == +$rootScope.adminPin);
            $scope.pin = null;
            $state.go('sites');
            return true;
        }
    }

    function getPin(login) {
        $cordovaPinDialog.prompt('Enter your PIN').then(
            function(result) {
                console.log(result);
                $scope.pin = result.input1;
                login();
                // result
            },
            function(error) {
                return false;
                // error
            });
    }

    function activate() {

        if (globals.DESKTOP) {
            $scope.user = globals.USER;
            $scope.pin = globals.PIN;
            login();
        } else {

            AccountsSrv.getEmail().then(function(email) {
                // some work with first user email registered on device
                $scope.user = email;
                $scope.pin = getPin(login);
            });
        }

    }

});

