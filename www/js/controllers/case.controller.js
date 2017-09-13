/**
 * Case Controller
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('CaseCtrl', CaseCtrl);

  CaseCtrl.$inject = ['$stateParams', '$ionicLoading', 'logger', 'CasesService'];

  function CaseCtrl($stateParams, $ionicLoading, logger, CasesService) {

    var vm     = this,
        logTag = "CaseCtrl";

    activate();

    /**
     * @function activate
     * @description Activates our view.
     * @return {[type]} [description]
     */
    function activate() {
  	// Start a loading spinner
	$ionicLoading.show({
      	template: '<p>Fetching case...</p><ion-spinner/>',
      	animation: 'fade-in',
      	showBackdrop: true,
      	duration: 120000,
       	delay : 400
	});

	// Attempt to get our case
	fetchCase($stateParams.caseId);
    }


    /**
     * @function fetchCase
     * @description Fetches all the case and applies them to our vm
     */
    function fetchCase(caseId){
    	// Make a call to our CaseService to get all the case. This service
    	// makes use of JavaScript promises
		CasesService.get(caseId).then(function(myCase){
			// We have our case - so assign them so our template can use them
            console.log(logTag, "Got case", myCase);
			vm.case = myCase;
			$ionicLoading.hide();
		}).catch(function(e){
            $ionicLoading.hide();
			logger.error(logTag, e);
		});
    }

  }

})();