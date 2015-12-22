angular.module('starter.controllers')

.controller('SitesAdminCtrl', function($firebaseArray, $rootScope, $scope, $cordovaSocialSharing, $state) {
    window.scope = $scope;
    $scope.listCanSwipe = $rootScope.isAdmin;
    $scope.del = del;
    $scope.addSite = addSite;
    $scope.save = save;
    $scope.sites = [];

    activate();

    ///////////////

    function addSite() {
        $scope.menuOpened = 'closed';
        var title = prompt("Name of site to add");
        if (title) {
            $scope.sites.$add({
                "title": title,
                "enabled": true
            });
        }
    };

    function save(site){
        $scope.sites.$save(site);
    }

    function del(site) {
            $scope.sites.$remove(site);
    }

    function activate() {
        $rootScope.$broadcast('loading:show');
        var itemsRef = new Firebase("https://gjservices.firebaseio.com/sites");
        $scope.sites = $firebaseArray(itemsRef);

        $scope.sites.$loaded(function() {
             console.log('Loaded sites');
             $rootScope.$broadcast('loading:hide');
         });
    }

});

