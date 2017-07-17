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

	RestCtrl.$inject = ['$ionicLoading', '$ionicPopup', 'McRestService', 'logger'];

	function RestCtrl($ionicLoading, $ionicPopup, McRestService, logger) {
		var logModule = 'app.RestCtrl';

		var vm = this;

		vm.getLatestChatter = getLatestChatter;
		vm.searchRemoteContacts = searchRemoteContacts;


		/**
		 * Request the latest chatter post. Uses the McRestService, which itself takes
		 *   care of running correctly on device or on CodeFlow. McRestService also
		 *   takes care of aligning auth sessions.
		 */
		function getLatestChatter(){
			$ionicLoading.show({
				template: 'Getting chatter post',
				animation: 'fade-in',
				showBackdrop: true,
				duration: 15000
			});
			var obj = {
				method: 'GET',
				contentType: 'application/json',
				path: '/services/data/v36.0/chatter/feeds/news/me/feed-elements'
			};
			McRestService.request(obj).then(function(result){
				console.log("getLatestChatter result", result);
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Last Chatter Post!',
					template: result.elements[0].actor.displayName + ': ' + result.elements[0].body.text
				});
				alertPopup.then(function(res) {
					// Do Nothing
				});
			}).catch(function(e){
				logger.error("getLatestChatter error",e);
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Sorry',
					template: 'Could not get the feed at this time.'
				});
				alertPopup.then(function(res) {
					// Do Nothing
				});
			});
		}


		/**
		 * Use the McRestService to request an online "LIKE" search for contacts, based
		 *   upon input from the UI
		 */
		function searchRemoteContacts(){
			$ionicLoading.show({
				template: 'Searching Salesforce',
				animation: 'fade-in',
				showBackdrop: true,
				duration: 15000
			});
			var soql = "SELECT name, id FROM Contact WHERE name LIKE '%" + vm.contactSearchStr + "%'";
			McRestService.query(soql).then(function(result){
				console.log("searchRemoteContacts result", result);
				$ionicLoading.hide();
				if ( result.records.length == 0 ) {
					var alertPopup = $ionicPopup.alert({
						title: 'No contacts found!',
						template: 'No match for "' +  vm.contactSearchStr + '"'
					});
					alertPopup.then(function(res) {
						// Do Nothing
					});
				} else {
					vm.contacts = result.records;
				}
			}).catch(function(e){
				logger.error("searchRemoteContacts error",e);
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Sorry',
					template: 'Could not search the contacts at this time.'
				});
				alertPopup.then(function(res) {
					// Do Nothing
				});
			});
		}
	}

})();