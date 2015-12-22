angular.module('starter.services')

.service('Work', function($firebaseArray, $localStorage, $q, $http, globals, $window) {

    var work = [];
    var $storage;

    var service = {
        saveWork: saveWork,
        getWork: getWork,
        getAllWork: getAllWork,
        getKey: getKey
    };

    activate();

    /////////////


    function getKey(dte, siteTitle) {
        return dte + '-' + siteTitle;
    }

    function getWork(dte, siteTitle) {
        return $storage[getKey(dte, siteTitle)] || {};
    }

    function saveWork(dte, siteTitle, site, title) {
        site.saved = false;
        site.title = title;
        site.isSite = true;
        site.timeCreated = new Date();
        site.workdate = dte;
        site.createdBy = localStorage.gjusername;
        if (site.salt || site.manHours || site.machineHours || site.src || site.comments) {
            $storage[getKey(dte, siteTitle)] = site;
        }
    }

    function getAllWork() {
        return work;
    }

    function getAllwork(dte, key) {
        return work;
    }

    function activate() {
        $storage = $localStorage;
        work = $storage;
    }

    return service;
})

