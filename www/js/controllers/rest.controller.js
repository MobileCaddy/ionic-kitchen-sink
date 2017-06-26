/**
 * Rest Controller
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('RestCtrl', RestCtrl);

  RestCtrl.$inject = ['$ionicPopup', 'McRestService', 'logger'];

  function RestCtrl($ionicPopup, McRestService, logger) {
  	var logModule = 'app.RestCtrl';

  	var vm = this;

  	vm.restCall = restCall;
  	vm.uploadFile = uploadFile;

  	function restCall(){
  		var obj = {
				method: 'GET',
				contentType: 'application/json',
				path: '/services/data/v36.0/chatter/feeds/news/me/feed-elements'
			};
			McRestService.request(obj).then(function(result){
				console.log("restCall result", result);
				var alertPopup = $ionicPopup.alert({
			    title: 'Last Chatter Post!',
			    template: result.elements[0].actor.displayName + ': ' + result.elements[0].body.text
			  });
			  alertPopup.then(function(res) {
			  	// Do Nothing
			  });
			}).catch(function(e){
				logger.error("restCall error",e);
			});
  	}

  	function uploadFile() {
  		// fileUpload.uploadFileToUrl(file);
			McRestService.upload(vm.file).then(function(result){
				console.log("restCall result", result);
			}).catch(function(e){
				logger.error("restCall error",e);
			});
  	}
  }

})();