angular.module('starter.controllers')

.controller('SitesCtrl', function(AuthService, globals, $cordovaEmailComposer, $cordovaFile, $scope, $sce, $ionicHistory, Sites, $rootScope, Slug, $firebaseArray, $cordovaCamera, $cordovaActionSheet, $cordovaDatePicker, $state, $ionicModal, $cordovaActionSheet) {
    //https://docs.google.com/spreadsheets/d/1jFzrJxeumJusopmoXyGntEkSFtUR1zOqtblXEdCLVgA/pub?gid=0&single=true&output=csv

    $ionicHistory.clearHistory();

    window.scope = $scope;

    $scope.menuOpened = 'closed';

    $scope.sites = [];
    $scope.showMenu = showMenu;
    $scope.doRefresh = doRefresh;
    $scope.createWork = createWork;
    $scope.chooseDate = chooseDate;
    $scope.shortDate = shortDate;
    $scope.listCanSwipe = $rootScope.isAdmin;
    $scope.del = del;
    $scope.addSite = addSite;
    $scope.isAdmin = AuthService.role() =='admin';
    $scope.addPhoto = addPhoto;
    $scope.deletePhoto = deletePhoto;
    $scope.goAdmin = goAdmin;
    $scope.sites = Sites;
    $scope.sendEmail = sendEmail;

    activate();

    //////////////////

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
            console.log('Loaded work');
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

    function doRefresh() {
        allSites.doRefresh().then(function(dta) {
            $scope.sites = dta;
            //Refresh the pull to refresh display
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

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

    function activate() {
        $scope.sites.$loaded(function() {
            console.log('Loaded sites');
            setDate();
            $rootScope.$broadcast('loading:hide');
        });
    }

    function getDataForEmail(sites) {
        sites = sites.filter(function(site) {
            //If it has an email, keep it
            return site.email;
        });

        sites = sites.map(function(site) {
            return {
                "user": site.email,
                "sand": site.sand || 0,
                "machine": site.machineHours || 0,
                "man": site.manHours || 0,
                "message": site.message || 'no message'
            }
        });

        return sites;
    }

    function sendEmail() {

        var work = getDataForEmail($scope.work);
        var filename = 'gj.csv';

        Papa.unparse(work)

        // Specifying fields and data explicitly
        var csv = Papa.unparse({
            fields: ['user', 'sand','machine','man','message'],
            data: work
        });


        $cordovaFile.writeFile(cordova.file.externalCacheDirectory, filename, csv, true)
            .then(function(success) {
                // success
                console.log('Written to ', cordova.file.externalCacheDirectory + filename, success);

                var email = {
                    to: globals.ADMIN_EMAIL,
                    attachments: [
                      cordova.file.externalCacheDirectory + filename
                    ],
                    subject: 'GJ Data',
                    body: 'Data sent from from Gj Services app',
                    isHtml: false
                  };

                  console.log('email:', email);

                 $cordovaEmailComposer.open(email).then(function(){
                    console.log('Email sent');
                 }, function () {
                   // user cancelled email
                    console.log('Email cancelled');
                 });








            }, function(error) {
                // error
                console.log('Not written', error);
            });



    }

    function JSONToCSVConvertor(JSONData, filename, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

        var CSV = '';
        //Set Report title in first row or line

        CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            var row = "";

            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {

                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);

            //append Label row with line break
            CSV += row + '\r\n';
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }

            row.slice(0, row.length - 1);

            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV == '') {
            alert("Invalid data");
            return;
        }

        console.log('Escaped CSV:', escape(CSV));

        console.log(cordova.file.externalCacheDirectory, filename);

        $cordovaFile.writeFile(cordova.file.externalCacheDirectory, filename, CSV, true)
            .then(function(success) {
                // success
                console.log('Written to ', cordova.file.externalCacheDirectory + filename, success);

                var email = {
                    to: globals.ADMIN_EMAIL,
                    attachments: [
                      cordova.file.externalCacheDirectory + filename
                    ],
                    subject: 'GJ Data',
                    body: 'Data sent from from Gj Services app',
                    isHtml: false
                  };

                  console.log('email:', email);

                 $cordovaEmailComposer.open(email).then(function(){
                    console.log('Email sent');
                 }, function () {
                   // user cancelled email
                    console.log('Email cancelled');
                 });








            }, function(error) {
                // error
                console.log('Not written', error);
            });

        return;

        //Generate a file name
        var fileName = "MyReport_";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g, "_");

        //Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }




});

