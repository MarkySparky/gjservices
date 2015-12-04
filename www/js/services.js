angular.module('starter.services', [])

.factory("Sites", function($firebaseArray) {
  var itemsRef = new Firebase("https://gjservices.firebaseio.com/sites");
  return $firebaseArray(itemsRef);
})

.service("Site", function($firebaseObject, $firebaseArray) {
  var ret = {};
  ret.getSite = function(key, dte){
	  	var url = "https://gjservices.firebaseio.com/"+dte.toLowerCase()+ '/' + key;
	  	console.log(url);
	  	var siteRef = new Firebase(url);
		var rec = $firebaseObject(siteRef);
		window.rec = rec;

 		return rec;
  }
  return ret;
})

.service('allSites', function($firebaseArray, $localStorage, $q){

console.log('All sites service file');

var sites = {};

var defaultSites = [{"title":"Banff Primary","$id":"0","$priority":null,"$$hashKey":"object:15"},{"title":"Rosehearty Primary","$id":"1","$priority":null,"$$hashKey":"object:16"},{"title":"Longside Primary","$id":"2","$priority":null,"$$hashKey":"object:17"},{"title":"Meldrum Primary","$id":"3","$priority":null,"$$hashKey":"object:18"},{"title":"Meldrum Academy","$id":"4","$priority":null,"$$hashKey":"object:19"},{"title":"Rothienorman Primary","$id":"5","$priority":null,"$$hashKey":"object:20"},{"title":"Kintore Primary","$id":"6","$priority":null,"$$hashKey":"object:21"},{"title":"Claypotts Castle Primary","$id":"7","$priority":null,"$$hashKey":"object:22"},{"title":"Craigowl Primary","$id":"8","$priority":null,"$$hashKey":"object:23"},{"title":"Downfield Primary","$id":"9","$priority":null,"$$hashKey":"object:24"},{"title":"Fintry Primary","$id":"10","$priority":null,"$$hashKey":"object:25"},{"title":"Grove Academy","$id":"11","$priority":null,"$$hashKey":"object:26"},{"title":"Rowantree Primary","$id":"12","$priority":null,"$$hashKey":"object:27"},{"title":"St Andrews Primary","$id":"13","$priority":null,"$$hashKey":"object:28"},{"title":"St Pauls Secondary","$id":"14","$priority":null,"$$hashKey":"object:29"},{"title":"Robertsons HQ","$id":"15","$priority":null,"$$hashKey":"object:30"},{"title":"Langlands Primary","$id":"16","$priority":null,"$$hashKey":"object:31"},{"title":"Whitehills Primary","$id":"17","$priority":null,"$$hashKey":"object:32"},{"title":"Strathmore Primary","$id":"18","$priority":null,"$$hashKey":"object:33"},{"title":"Whitehills Hospital","$id":"19","$priority":null,"$$hashKey":"object:34"},{"title":"Beechhill Care home","$id":"20","$priority":null,"$$hashKey":"object:35"}];

var ret = {};
ret.doRefresh = doRefresh;
ret.getSite = getSite;
ret.getSites = getSiteList;
ret.setSites = setSiteList;
ret.saveSite = saveSite;
ret.getSiteList = getSiteList;




activate();
/////////////////////

	// Save site in format:
	// saveSite ('Comrie', '28-09-2015')
	function saveSite(site, date) {
		var existingSites = $storage['sites'];
		existingSites = _.without(existingSites, _.findWhere(existingSites, {"title":"site.title","date": date}));
		site.date = date;
		existingSites.push(site);
		$storage['sites'] = existingSites;
	}

	function setSiteList(siteList){
		$storage['siteList'] = siteList;
	}

	function getSiteList(){
		return $storage['siteList'];
	}

	function getSite(title, date){
		var sites = $storage['sites'] || [];
		var site = _.chain(sites).filter(function (site) { return site.title === title }).first().value()
		var ret = site || {"title":title,"date":date};
		return ret;
	}

	function doRefresh () {

		var deferred = $q.defer();

		data.$loaded()
		  .then(function(data) {
		  	setSiteList(data);
		    deferred.resolve(data);
		  })
		  .catch(function(err) {
		    deferred.reject(err);
		  });

		return deferred.promise;		  
	}

	function activate(){
		$storage = $localStorage.$default({
		    siteList: defaultSites
		});			
	}

	return ret;

});
