'use strict';

angular.module('starter')

.controller('AllWorkController', function($scope, $rootScope, $cordovaEmailComposer, $cordovaFile, $state, globals, $firebaseArray) {
    //https://docs.google.com/spreadsheets/d/1jFzrJxeumJusopmoXyGntEkSFtUR1zOqtblXEdCLVgA/pub?gid=0&single=true&output=csv

    var workRef = new Firebase('https://gjservices.firebaseio.com/work/');
    var work = $firebaseArray(workRef);
    window.scope = $scope;
    $scope.sendEmail = sendEmail;

    activate();

    function activate() {
        //$rootScope.$broadcast('loading:show');
        work.$loaded(function(work) {
            console.log('Loaded yay');
            //$rootScope.$broadcast('loading:hide');
            $scope.work = work;
        });
    }

    function getDataForEmail(dates) {
        console.log('sites', dates);

        var sitesForEmail = [];

        angular.forEach(dates, function(dte) {
            console.log('dte:', dte);

            for (var p in dte) {
                console.log(p.toString());
                if (dte.hasOwnProperty(p) && p.indexOf('$')===-1) {
                    console.log('Adding this site');
                    sitesForEmail.push(dte[p]);
                }
            }
        });

        console.log('Sites for email:', sitesForEmail);

        sitesForEmail = sitesForEmail.map(function(site) {
            return {
                "user": site.createdBy || 'Unknown',
                "time": site.timeCreated || 'Unknown',
                "salt": site.salt || 0,
                "machine": site.machineHours || 0,
                "man": site.manHours || 0,
                "workdate": site.workdate || 'not set',
                "comments": site.comments || 'no message'
            }
        });

        return sitesForEmail;
    }

    function sendEmail() {

        console.log($scope.work);

        var work = getDataForEmail($scope.work);
        var filename = 'gj.csv';

        Papa.unparse(work)

        // Specifying fields and data explicitly
        var csv = Papa.unparse({
            fields: ['user', 'time', 'salt', 'machine', 'man', 'workdate', 'comments'],
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

                $cordovaEmailComposer.open(email).then(function() {
                    console.log('Email sent');
                }, function() {
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

                $cordovaEmailComposer.open(email).then(function() {
                    console.log('Email sent');
                }, function() {
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

