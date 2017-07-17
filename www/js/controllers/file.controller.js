/**
 * Audio Controller - basic controller to demo how plugins and the McrestService
 * 	_could_ be used to support capture, playback and upload of files to SFDC, and
 * 		the pulling of remote files and storage.
 * 	By no means a full solution, but a proof-of-concept.
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('FileCtrl', FileCtrl);

  FileCtrl.$inject = ['$scope', '$ionicLoading', '$ionicPopup', 'McRestService', 'logger'];

  function FileCtrl($scope, $ionicLoading, $ionicPopup, McRestService, logger) {
  	var logModule = 'app.FileCtrl';

  	var vm = this;

  	vm.listRemote = listRemote;
  	vm.viewRemote = viewRemote;

  	/**
  	 * Request a remote listing of files for our user, using the REST handling of
  	 *   the McRestService
  	 */
  	function listRemote() {
  		$ionicLoading.show({
				template: 'Fetching remote file details',
				animation: 'fade-in',
				showBackdrop: true,
				duration: 15000
			});
  		var obj = {
				method: 'GET',
				contentType: 'application/json',
				path: '/services/data/v40.0/connect/files/users/me'
			};
			McRestService.request(obj).then(function(result){
				console.log("restCall result", result);
				vm.fs = result.files;
				$ionicLoading.hide();
				$scope.$apply();
			}).catch(function(e){
				logger.error("restCall error",e);
				$ionicLoading.hide();
			});
  	}


  	/**
  	 * Requests playing of a file that exists on SFDC. Will download and store the
  	 *   file locally (in this instance into toplevel external dir) and then play it.
  	 *   If the file has already been downloaded then will be directly played.
  	 *   Note the listing of remote files that has been downloaded is not persisted
  	 *   anywhere in this implementation, and serve as just an example.
  	 * @param  {[type]} myfile [description]
  	 * @param  {[type]} idx    [description]
  	 * @return {[type]}        [description]
  	 */
  	function viewRemote(myfile, idx) {
  		console.log("playRemote");
  		if ( myfile.downloaded ) {
  			openFile(myfile.id + '.' + myfile.fileExtension);
  		} else {
  			// Download and then play.
	  		var obj = {
	  			method: 'GET',
	  			path: myfile.downloadUrl
	  		};
				McRestService.requestBuffer(obj).then(function(result){
					console.log("downloadRemote result", result);
					var dataObj = new Blob([result]);

					saveFile(myfile, dataObj).then(function(result){
						vm.fs[idx].downloaded = true;
						$scope.$apply();
						$ionicLoading.hide();
  					openFile(myfile.id + '.' + myfile.fileExtension);
					}).catch(function(e){
						logger.error(e);
					});
					$ionicLoading.hide();
					$scope.$apply();
				}).catch(function(e){
					logger.error("restCall error",e);
					$ionicLoading.hide();
				});
			}
  	}

  	function saveFile(myfile, dataObj) {
      return new Promise(function(resolve, reject) {
      	window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dirEntry) {
				    console.log('file system open: ' + dirEntry.name);
				    dirEntry.getFile(myfile.id + '.' + myfile.fileExtension, {create: true, exclusive: false},
				    	function(fileEntry) {
				    		writeFile(fileEntry, dataObj).then(function(){
				    			resolve();
				    		}).catch(function(e){
				    			logger.error(e);
				    			reject();
				    		});
				    	},
				    	function(e){
								console.error(e);
								reject(e);
							});
				},
				function(e){
					console.error(e);
					reject(e);
				});
      });
  	}



		function writeFile(fileEntry, dataObj) {
      return new Promise(function(resolve, reject) {
		    // Create a FileWriter object
		    fileEntry.createWriter(function (fileWriter) {

	        fileWriter.onwriteend = function() {
	            console.log("Successful file write...");
	            resolve();
	        };

	        fileWriter.onerror = function (e) {
	            console.log("Failed file write: " + e.toString());
	            reject(e);
	        };
	        fileWriter.write(dataObj);
		    });
	  	});
		}

		function openFile(fileName) {
			var ref = cordova.InAppBrowser.open('file:///storage/emulated/0/' + fileName, '_blank', 'location=yes');
		}
  }

})();