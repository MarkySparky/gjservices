angular.module('starter.controllers')

.controller('SiteCtrl', function($firebaseArray, Work, globals, 
    $rootScope, $scope, $localStorage, $timeout, debounce, Slug, 
    $cordovaSocialSharing, Sites, $stateParams, $ionicActionSheet, 
    $cordovaCamera, $filter, $state, $cordovaActionSheet) {
    window.scope = $scope;
    $scope.addPhoto = addPhoto;
    $scope.deletePhoto = deletePhoto;
    $scope.sendSite = sendSite;
    $scope.saveWork = saveWork;

    $scope.date = $stateParams.date;
    $scope.key = $stateParams.key;
    $scope.title = $stateParams.title;
    $scope.$storage = $localStorage;
    $scope.menuOpened = 'closed';
    $rootScope.email = $rootScope.email || globals.USER;
    $scope.work = {};

    activate();

    ///////////////

    function saveWork() {
        console.log('Saving site');
        Work.saveWork($scope.date, $scope.key, $scope.work, $scope.title);
        $state.go('sites');
    }

    function sendSite() {
        console.log($scope.site.src);
        $cordovaSocialSharing
            .share('hello there, this is the message', 'This is the subject', $scope.site.src, 'http://www.ginger.land') // Share via native share sheet
            .then(function(result) {
                // Success!
                alert('Its been sent ' + result)
            }, function(err) {
                // An error occured. Show a message to the user
                alert('Theres been an error ' + err)
            });
    }

    function addPhoto() {
        $scope.menuOpened = 'closed';
        var actionSheetOptions = {
            title: 'Please choose',
            buttonLabels: ['Choose from gallery', 'Take a picture'],
            addCancelButtonWithLabel: 'Cancel',
            androidEnableCancelButton: true,
            winphoneEnableCancelButton: true
        };

        var cameraOptions = {
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 320,
            allowEdit: false,
            quality: 25,
            correctOrientation: true
        };

        $cordovaActionSheet.show(actionSheetOptions)
            .then(function(btnIndex) {

                if (btnIndex === 3) {
                    return;
                }

                cameraOptions.sourceType = btnIndex - 1;
                console.log(btnIndex);

                $cordovaCamera.getPicture(cameraOptions).then(
                    function(data) {
                        console.log('Got camera data success:' + data);
                        $scope.work.src = "data:image/jpeg;base64," + data;;
                    },
                    function(error) {
                        console.log('Got camera data failure:' + error);
                    }
                );
            });
    }

    // Triggered on a button click, or some other target
    function deletePhoto() {
        $scope.work.email = $rootScope.email;
        $scope.menuOpened = 'closed';
        if(confirm('Delete this photo?')){
            $scope.work.src = '';            
        }
        //$state.reload();
    }

    function activate() {
        $scope.work = Work.getWork($scope.date, $scope.key) || {};
    }
});

