/**
 * Cases Controller
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('CasesCtrl', CasesCtrl);

  CasesCtrl.$inject = ['$scope', '$ionicLoading', 'logger', 'CasesService'];

  function CasesCtrl($scope, $ionicLoading, logger, CasesService) {

    var vm     = this,
        logTag = "CasesCtrl";

    vm.search = {};

    // exposed functions
    vm.clearSearch = clearSearch;

    activate();

    /**
     * @function activate
     * @description Activates our view.
     * @return {[type]} [description]
     */
    function activate() {
      // Start a loading spinner
      $ionicLoading.show({
        template: '<p>Fetching cases...</p><ion-spinner/>',
        animation: 'fade-in',
        showBackdrop: true,
        duration: 120000,
        delay : 400
      });

      // Attempt to get our cases
      fetchCases();
    }


    /**
     * @functionclearSearch
     * @description clears search box
     */
    function clearSearch () {
      vm.search.query = "";
    }


    /**
     * @function fetchCases
     * @description Fetches all the cases and applies them to our vm
     */
    function fetchCases(){
      // Make a call to our CasesService to get all the cases. This service
      // makes use of JavaScript promises
      CasesService.all().then(function(cases){
        // We have our cases - so assign them so our template can use them
        vm.cases = cases;
        $ionicLoading.hide();
      }).catch(function(e){
        $ionicLoading.hide();
        logger.error(logTag, e);
      });
    }


    // Handle events fired from the SyncService (that is part of the shell code)
    // We do this so as to update our case list if our Case__ap table has been sync'd
    var deregisterHandleSyncTables = $scope.$on('syncTables', function(event, args) {
      console.log(logTag, "syncTables", args);
      if ( args.table && args.table == 'Case__ap' && args.result == 100400 ) {
        fetchCases();
      }
    });


    // Handles $destroy event - cleans some listeners etc up
    $scope.$on('$destroy', function() {
      // We need to deregister our $scope.on to remove memory leak.
      deregisterHandleSyncTables();
    });

  }

})();