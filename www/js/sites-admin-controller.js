angular.module('starter.controllers')

.controller('SitesAdminCtrl', function($firebaseArray, Sites, $rootScope, $scope, $cordovaSocialSharing, $state) {
    window.scope = $scope;
    $scope.sites = Sites;
    $scope.listCanSwipe = $rootScope.isAdmin;
    $scope.del = del;
    $scope.addSite = addSite;

    activate();

    ///////////////

    function addSite() {
        $scope.menuOpened = 'closed';
        var title = prompt("Name of site to add");
        if (title) {
            $scope.sites.$add({
                "title": title
            });
        }
    };

    function del(site) {
            $scope.sites.$remove(site);
    }

    function activate() {
        $scope.sites.$loaded(function() {
            console.log('Loaded sites');
            $rootScope.$broadcast('loading:hide');
        });
    }

});

