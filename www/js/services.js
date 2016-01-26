angular.module('starter.services', [])

.service('Sync', function(globals, $localStorage, $http, $q, $firebaseArray, $firebaseObject, Slug) {

    function shortDate(theDate) {
        return moment(theDate).format('DD-MMM-YYYY');
    }

    var service = {
        pushToServer: pushToServer,
        pullFromServer: pullFromServer
    };

    function pushToServer() {
        var deferred = $q.defer();
        //Loop through local storage for today sending unsent data to the server
        console.log('pushing');
        var local = $localStorage;
        console.log('localstorage:', local);
        //Loop all local storage items, filtering for todays date
        var qty = 0;
        for (var entry in local) {
            if (local.hasOwnProperty(entry) && local[entry].isSite && !local[entry].saved) {
                qty = qty + 1;
                // do stuff
                //send to server
                console.log('Sending ', local[entry], ' to server');
                var site = local[entry];
                var siteRef = new Firebase('https://gjservices.firebaseio.com/work/' + site.workdate + '/' + site.title);
                //The following 2 function calls are equivalent
                siteRef.update(site, function() {
                    console.log('update succeeded');
                    local[entry].saved = true;
                    deferred.resolve();
                });
            }
        }
        if (qty===0) {
            console.log('Nothing to sync');
            deferred.resolve();
        }
        return deferred.promise;
    }

    function pullFromServer(workdate) {

        var deferred = $q.defer();
        //Loop through local storage for today sending unsent data to the server
        console.log('pulling');


        var local = $localStorage;
        var workRef = new Firebase('https://gjservices.firebaseio.com/work/' + Slug.slugify(shortDate(workdate)));
        var work = $firebaseObject(workRef);
        work.$loaded(function() {
            console.log(work);
            var qty = 0;
            for (var entry in work) {
                if(entry !=='$priority' && work[entry] && work[entry].title){
                    qty = qty + 1;
                    var site = Slug.slugify(work[entry].title);
                    var storageKey = Slug.slugify(shortDate(workdate) + '-' + site);
                    local[storageKey] = work[entry];
                    local[storageKey].saved=true;
                            deferred.resolve();
                }
            }
            if(qty===0){
                            deferred.resolve();
            }
        });
        return deferred.promise;
    }

    return service;

})

.service('Sites', function($firebaseArray, $localStorage, $q, $http, globals) {

    console.log('All sites service file');

    defaultSites = [
        {
            "title": "Banfff Primary",
            "enabled": true
                },
        {
            "title": "Rosehearty Primary",
            "enabled": true
                },
        {
            "title": "Longside Primary",
            "enabled": true
                },
        {
            "title": "Meldrum Primary",
            "enabled": true
                },
        {
            "title": "Meldrum Academy",
            "enabled": true
                },
        {
            "title": "Rothienorman Primary",
            "enabled": true
                },
        {
            "title": "Kintore Primary",
            "enabled": true
                },
        {
            "title": "Craigowl Primary",
            "enabled": true
                },
        {
            "title": "Downfield Primary",
            "enabled": true
                },
        {
            "title": "Fintry Primary",
            "enabled": true
                },
        {
            "title": "St Andrews Primary",
            "enabled": true
                },
        {
            "title": "St Pauls Secondary",
            "enabled": true
                },
        {
            "title": "Robertsons HQ",
            "enabled": true
                },
        {
            "title": "Strathmore Primary",
            "enabled": true
                },
        {
            "title": "Whitehills Hospital",
            "enabled": true
                },
        {
            "title": "Beechhill Care home",
            "enabled": true
                },
        {
            "title": "Whitehills Primary",
            "enabled": true
                },
    ];

    var ret = {};
    ret.doRefresh = doRefresh;
    ret.getSite = getSite;
    ret.getSites = getSiteList;
    ret.setSites = setSiteList;
    ret.saveSite = saveSite;
    ret.getSiteList = getSiteList;
    ret.setSiteList = setSiteList;

    activate();
    /////////////////////

    // Save site in format:
    // saveSite ('Comrie', '28-09-2015')
    function saveSite(site, date) {
        var existingSites = $storage['sites'];
        existingSites = _.without(existingSites, _.findWhere(existingSites, {
            "title": "site.title",
            "date": date
        }));
        site.date = date;
        existingSites.push(site);
        $storage['sites'] = existingSites;
    }

    function setSiteList(siteList) {
        console.log('Setting site list to ', siteList);
        $storage['siteList'] = siteList;
    }

    function getSiteList() {
        return $storage['siteList'];
    }

    function getSite(title, date) {
        var sites = $storage['sites'] || [];
        var site = _.chain(sites).filter(function(site) {
            return site.title === title
        }).first().value()
        var ret = site || {
            "title": title,
            "date": date
        };
        return ret;
    }

    function doRefresh() {

        console.log('Doing refresh');

        var deferred = $q.defer();

        $http.get(globals.URL + '/sites.json').then(function(response) {
            console.log('resolving');

            var sites = response.data;

            var enabledSites = [];

            for (var property in sites) {
                if (sites.hasOwnProperty(property) && sites[property].enabled) {
                    // do stuff
                    enabledSites.push({
                        "title": sites[property].title
                    });
                }
            }

            console.log('sites enabled:', enabledSites);

            var sites = enabledSites;
            setSiteList(sites);
            deferred.resolve(sites)
        }, function(error) {
            console.log('rejecting:', error);
            // Stop the ion-refresher from spinning
            deferred.reject();
        })
        return deferred.promise;
    };

    function activate() {
        $storage = $localStorage.$default({
            siteList: defaultSites
        });
    }

    return ret;

});

