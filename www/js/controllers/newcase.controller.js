/**
 * Cases Controller
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('NewCaseCtrl', NewCaseCtrl);

  NewCaseCtrl.$inject = ['$ionicPopup', '$ionicHistory', '$ionicLoading', 'logger', 'CasesService'];

  function NewCaseCtrl($ionicPopup, $ionicHistory, $ionicLoading, logger, CasesService) {

    var vm     = this,
        logTag = "NewCaseCtrl";

    vm.submitCase = submitCase;

    /**
     * @function fetchCases
     * @description Fetches all the cases and applies them to our vm
     */
    function submitCase(){
      console.log(logTag, "submitCase", vm.caseDescription);

      var newCase = {
        'Description' : vm.caseDescription
      };

      CasesService.insert(newCase).then(function(cases){
        // Insert success
        $ionicHistory.goBack();
      }).catch(function(e){
        logger.error(logTag, e);
      });
    }

  }

})();