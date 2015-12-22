// GJ Services

angular.module('starter', ['ionic', 'firebase', 'ngStorage', 'ng-mfb', 'slugifier', 'starter.controllers', 'starter.services', 'ngStorage', 'ngCordova', 'angularMoment', 'monospaced.elastic'])

.config(function($stateProvider, $httpProvider, $compileProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|mailto|content|tel|blob):|file:|data:image\/)/);

    //    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|tel):|file:|data:image\/)/);

    /*
        $httpProvider.interceptors.push(function($rootScope) {
            return {
                request: function(config) {
                    $rootScope.$broadcast('loading:show');
                    return config;
                },
                response: function(response) {
                    $rootScope.$broadcast('loading:hidey');
                    return response;
                }
            };
        });
    */
    $ionicConfigProvider.navBar.alignTitle('center');

    $stateProvider

        .state('root', {
        url: '/',
        controller: 'AuthController'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('pin', {
        url: '/pin',
        templateUrl: 'templates/pin.html',
        controller: 'PinCtrl'
    })

    .state('sitesadmin', {
        url: '/sitesadmin',
        templateUrl: 'templates/sitesadmin.html',
        controller: 'SitesAdminCtrl'
    })

    .state('allwork', {
        url: '/allwork',
        templateUrl: 'templates/allwork.html',
        controller: 'AllWorkController'
    })

    .state('sites', {
        url: '/sites',
        templateUrl: 'templates/sites.html',
        controller: 'SitesCtrl',
        resolve: {
            allStorage: function(Work){
                console.log('Work from resolve');
                return Work.getAllWork();
            }
        }
    })

    .state('site', {
        url: '/site/:date/:key/:title',
        templateUrl: 'templates/site.html',
        controller: 'SiteCtrl'
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/pin');

})

.run(function($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, globals) {

    window.$ionicLoading = $ionicLoading;

    $rootScope.$on('loading:show', function() {
        console.log('loading show');
        $ionicLoading.show({
            template: 'Loading...'
        });
    });

    $rootScope.$on('loading:hide', function() {
        console.log('loading hide');
        $ionicLoading.hide();
    });

    $rootScope.isAdmin = false;
    $rootScope.loggedIn = false;

    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        // track the state the user wants to go to; authorization service needs this
        if ($rootScope.toState !== 'login') {
            return $rootScope.loggedId;
        } else {
            return true;
        }
    });

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)

        if (window.cordova && window.cordova.plugins.Keyboard) {
            $cordovaSplashscreen.hide();
        }

        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }

        if (window.cordova && window.cordova.logger) {
            window.cordova.logger.__onDeviceReady();
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.overlaysWebView(false);
            StatusBar.backgroundColorByHexString('#3F51AA');
        }

    });
})


// 'starter.controllers' is found in controllers.js
angular.module('starter.controllers', [])
    .controller('AuthController', function($state, $scope, $ionicModal, $timeout, AuthService) {

        AuthService.activate();

        return;


        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function() {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function() {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function() {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function() {
                $scope.closeLogin();
            }, 1000);
        };

        $scope.login();
    })

.constant('angularMomentConfig', {
    timezone: 'Europe/London' // e.g. 'Europe/London'
})

.constant('pins', {
    user: 1234, // e.g. 'Europe/London'
    admin: 4321 // e.g. 'Europe/London'
})

.constant('globals', {
    URL: 'https://gjservices.firebaseio.com',
    URL2: 'api',
    ADMIN_EMAIL: 'markacaulfield@googlemail.com',
    DESKTOP: !(!!window.plugins), // e.g. 'Europe/London'
    USER: 'markacaulfield@googelemail.com',
    PIN: 4321
})

.factory('debounce', function($timeout) {
    return function(callback, interval) {
        var timeout = null;
        return function() {
            $timeout.cancel(timeout);
            timeout = $timeout(function() {
                callback.apply(this, args);
            }, interval);
        };
    };
})

.directive("limitTo", [function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            elem.bind('keypress', function(e) {
                //console.log(e.charCode)
                if (elem[0].value.length >= limit) {
                    //console.log(e.charCode)
                    e.preventDefault();
                    return false;
                }
            });
        }
    }
    }]);;

