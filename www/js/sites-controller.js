angular.module('starter.controllers')

.controller('SitesCtrl', function($q, $cordovaToast, Sites, Sync, allStorage, AuthService, globals, $cordovaEmailComposer, $cordovaFile, $scope, $sce, $ionicHistory, $rootScope, Slug, $firebaseArray, $cordovaCamera, $cordovaActionSheet, $cordovaDatePicker, $state, $ionicModal, $cordovaActionSheet) {
    //https://docs.google.com/spreadsheets/d/1jFzrJxeumJusopmoXyGntEkSFtUR1zOqtblXEdCLVgA/pub?gid=0&single=true&output=csv

    $ionicHistory.clearHistory();

    window.scope = $scope;

    $scope.menuOpened = 'closed';

    $scope.sites = [];
    $scope.Slug = Slug;
    $scope.showMenu = showMenu;
    $scope.doRefresh = doRefresh;
    $scope.isRefreshing = false;
    $scope.createWork = createWork;
    $scope.chooseDate = chooseDate;
    $scope.shortDate = shortDate;
    $scope.listCanSwipe = $rootScope.isAdmin;
    $scope.del = del;
    $scope.addSite = addSite;
    $scope.isAdmin = AuthService.role() == 'admin';
    $scope.addPhoto = addPhoto;
    $scope.deletePhoto = deletePhoto;
    $scope.goAdmin = goAdmin;
    $scope.sites = Sites.getSiteList();
    $scope.sendEmail = sendEmail;
    $scope.workDate = new Date();
    $scope.allStorage = allStorage;
    window.scope = $scope;
    $scope.getWorkFor = getWorkFor;
    $scope.pullFromServer = pullFromServer;
    $scope.pushToServer = pushToServer;
    $scope.menuOpened = 'closed';

    activate();

    //////////////////
    function sendEmail() {
        console.log('Sending email');
    }


    function doRefresh() {
        var deferred = $q.defer();
        $scope.isRefreshing = true;
        console.log('Doing refresh');
        $scope.pushToServer().then(function() {
            console.log('Done pushing, Pulling');
            $scope.pullFromServer();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.isRefreshing = false;
            deferred.resolve();
            $cordovaToast.showShortCenter('Data is up-to-date').then(function(success) {
                // success
            }, function(error) {
                // error
            });


        })
        return deferred.promise;
    };

    function pullFromServer() {
        var deferred = $q.defer();
        $scope.menuOpened = 'closed';
        Sync.pullFromServer($scope.workDate).then(function() {
            console.log('Done pulling');


            Sites.doRefresh().then(function(enabledSites) {
                console.log('Sites:', $scope.sites);

                console.log('Setting Enabled Sites:', enabledSites);

                Sites.setSites(enabledSites);
                $scope.sites = Sites.getSiteList();

            });


            deferred.resolve();
        });
        return deferred.promise;
    }

    function pushToServer() {
        var deferred = $q.defer();
        $scope.menuOpened = 'closed';
        Sync.pushToServer($scope.workDate).then(function() {
            console.log('Done pushing');
            deferred.resolve();
        });
        return deferred.promise;

    }

    function getWorkFor(site) {
        var key = Slug.slugify($scope.shortDate($scope.workDate) + '-' + site.title);
        var ret = allStorage[key];
        return ret;
    }

    function goAdmin() {
        $scope.menuOpened = 'closed';
        $state.go('sitesadmin');
    }

    function setDate(dte) {
        $scope.workDate = dte || new Date();
        $rootScope.$broadcast('loading:show');
        fetchWork(dte);
    }

    function fetchWork(dte) {
        dte = dte || $scope.workDate;
        var slug = Slug.slugify(shortDate(dte));
        var workUrl = 'https://gjservices.firebaseio.com/' + slug;
        var workRef = new Firebase(workUrl);
        // Bind the todos to the firebase provider.
        $scope.work = $firebaseArray(workRef);
        $scope.work.$loaded(function() {
            //Ensure sites present for this date
            $scope.sites.forEach(function(site) {
                console.log('Looping sites');
                var present = $scope.work.filter(function(w) {
                    return w.title === site.title;
                });
                console.log(present);
                if (!present[0]) {
                    console.log('Not got this site, add it');
                    $scope.work.$add(site);
                    console.log(site);
                } else {
                    console.log('Got this site already');
                }

            });
            $rootScope.$broadcast('loading:hide');
        });
    }

    //////////////

    function addSite() {
        $scope.menuOpened = 'closed';
        var title = prompt("Sitename to add");
        if (title) {
            $scope.sites.$add({
                "title": title
            });
        }
    };

    function del(site) {
        if (confirm("Are you sure?")) {
            $scope.sites.$remove(site)
        }
    }

    function shortDate(theDate) {
        return moment(theDate).format('DD-MMM-YYYY');
    }

    function chooseDate() {

        var dtOptions = {
            date: $scope.workDate,
            mode: 'date', // or 'time'
            maxDate: Date.parse(new Date()),
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
        };

        $cordovaDatePicker.show(dtOptions).then(function(date) {
            $scope.workDate = date;
            setDate($scope.workDate);
        });
    }

    function showMenu() {
        $cordovaActionSheet.show(options)
            .then(function(btnIndex) {
                var index = btnIndex;
                $state.go('login');
            });
    }

    // Called when the form is submitted
    function createWork(work) {
        $scope.work.push({
            title: work.title
        });
        $scope.workModal.hide();
        work.title = "";
    };

    function deletePhoto(site) {
        if (confirm('Really delete this photo?')) {
            delete site.image;
        }
    }

    function addPhoto(site) {

        var labels = ['Choose from gallery', 'Take a picture']

        if (site.image) {
            labels.push('Delete this photo');
        }

        var actionSheetOptions = {
            title: 'Please choose',
            buttonLabels: labels,
            addCancelButtonWithLabel: 'Cancel',
            androidEnableCancelButton: true,
            winphoneEnableCancelButton: true
        };

        var cameraOptions = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            allowEdit: false,
            quality: 25,
            correctOrientation: true
        };

        console.log(cameraOptions);

        $cordovaActionSheet.show(actionSheetOptions)
            .then(function(btnIndex) {

                var btn = actionSheetOptions.buttonLabels[btnIndex - 1];

                if (!btn) {
                    //Cancel pressed
                    return;
                }

                if (btn === 'Delete this photo') {
                    deletePhoto(site);
                    return;
                }

                if (btn === 'cancel') {
                    return;
                }

                cameraOptions.sourceType = btnIndex - 1;

                $cordovaCamera.getPicture(cameraOptions).then(
                    function(data) {
                        console.log('Got camera data success:' + data);
                        var src = "data:image/jpeg;base64," + data;
                        site.image = $sce.trustAsResourceUrl(src);
                        site.image = src;
                        site.$save();
                        console.log(site);
                    },
                    function(error) {
                        console.log('Got camera data failure:' + error);
                    }
                );


            });
    }

    function activate() {}
});

