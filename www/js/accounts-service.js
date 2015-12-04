// for Accounts plugin : hhttps://github.com/loicknuchel/cordova-device-accounts
angular.module('starter.services')
.factory('AccountsSrv', function($q, $window, $ionicPlatform){
  'use strict';
  var service = {
    getAccounts: getAccounts,
    getByType: getByType,
    getEmails: getEmails,
    getEmail: getEmail
  };

  function getAccounts(){
    var defer = $q.defer();
    pluginReady(function(){
      $window.plugins.DeviceAccounts.get(function(accounts){
        defer.resolve(accounts);
      }, function(error){
        defer.reject(error);
      });
    });
    return defer.promise;
  }

  function getByType(type){
    var defer = $q.defer();
    pluginReady(function(){
      $window.plugins.DeviceAccounts.getByType(type, function(accounts){
        defer.resolve(accounts);
      }, function(error){
        defer.reject(error);
      });
    });
    return defer.promise;
  }

  function getEmails(){
    var defer = $q.defer();
    pluginReady(function(){
      $window.plugins.DeviceAccounts.getEmails(function(emails){
        defer.resolve(emails);
      }, function(error){
        defer.reject(error);
      });
    });
    return defer.promise;
  }

  function getEmail(){
    var defer = $q.defer();
    pluginReady(function(){
      $window.plugins.DeviceAccounts.getEmail(function(email){
        defer.resolve(email);
      }, function(error){
        defer.reject(error);
      });
    });
    return defer.promise;
  }

  function pluginReady(fn){
    $ionicPlatform.ready(function(){
      if($window.plugins && $window.plugins.DeviceAccounts){
        fn();
      } else {
        console.log('pluginNotFound:DeviceAccounts');
      }
    });
  }

  return service;
})