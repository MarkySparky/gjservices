// for Accounts plugin : hhttps://github.com/loicknuchel/cordova-device-accounts

angular.module('starter.services')

.factory('AuthService', function($rootScope, $q, $state, $window, $ionicPlatform, pins, globals, AccountsSrv, $ionicPopup) {

    var authenticated = false;
    var username = '';
    var role = '';
    var AUTH_KEY = 'gjusername';

    activate();

    var service = {
        login: login,
        logout: logout,
        getPin: getPin,
        activate: activate,
        getUsername: getUsername,
        role: function() {
            return role
        },
        username: function() {
            return username
        },
        isAuthenticated: function() {
            return isAuthenticated
        }
    };

    function restoreState() {
        username = window.localStorage[AUTH_KEY] || '';
        console.log('Username:', username);
    }

    function logout() {
        authenticated = false;
        username = '';
        role = '';
        delete window.localscope[AUTH_KEY];
        $state.go('root');
    }

    function login(username, pin) {

        return $q(function(resolve, reject) {

            if (username && (pin == pins.user || pin == pins.admin)) {
                if (pin == pins.admin) {
                    role = 'admin';
                } else {
                    role = 'public';
                }
                window.localStorage[AUTH_KEY] = username;
                resolve('Login succeeded');
            } else {
                alert('Wrong PIN code, try again');
                reject('Login failed');
            }
        });
    }

    function getUsername() {
        var x = prompt('Enter your username', username)
        if (x) {
            return x;
        } else {
            ionic.Platform.exitApp();
        }
    }

    function getPin() {
        var deferred = $q.defer();
        $cordovaPinDialog.prompt('Enter your PIN', 'Please authenticate').then(
            function(result) {
                deferred.resolve(result.input1);
                // result
            },
            function(error) {
                deferred.reject(false);
                // error
            });
        return deferred.promise;
    }

    function activate() {
        restoreState();
    }

    return service;
});

