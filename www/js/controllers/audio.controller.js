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
    .controller('AudioCtrl', AudioCtrl);

  AudioCtrl.$inject = ['$scope', '$ionicLoading', '$ionicPopup', 'McRestService', 'logger'];

  function AudioCtrl($scope, $ionicLoading, $ionicPopup, McRestService, logger) {
  	var logModule = 'app.AudioCtrl';

  	var vm = this;

  	vm.record = record;
  	vm.playCapture = playCapture;
  	vm.uploadFile = uploadFile;
  	vm.listRemote = listRemote;
  	vm.playRemote = playRemote;

  	var src = "myrecording.amr";

  	/**
  	 * Uses a cordova plugin to record 5 seconds of audio and store it in a temp
  	 * local file.
  	 */
  	function record(){
  		console.log(logModule, 'record');

			$ionicLoading.show({
				template: 'Recording for 5 seconds, talk now',
				animation: 'fade-in',
				showBackdrop: true,
				duration: 5000
			});

	    var src = "myrecording.amr";
	    var mediaRec = new Media(src,
	      // success callback
	      function() {
	          console.log("recordAudio():Audio recording Success");
	          vm.audioPath = src;
	          $scope.$apply();
	      },

	      // error callback
	      function(err) {
	          console.log("recordAudio():Audio Error: "+ err.code);
	      });

	    // Record audio
	    mediaRec.startRecord();
	      // Pause Recording after 5 seconds
	    setTimeout(function() {
	        mediaRec.stopRecord();
	    }, 5000);
  	}

  	/**
  	 * Plays our local audio file. If no fileName is specified then attempt to
  	 *   play the temporary 'myrecording.amr' file
  	 */
  	function playCapture(fileName) {
  		console.log(logModule, 'playCapture', fileName);
  		if ( ! fileName ) fileName = "myrecording.amr";
	    var my_media = new Media(fileName,
	        // success callback
	        function () {
	            console.log("playAudio():Audio Success");
	        },
	        // error callback
	        function (err) {
	            console.log("playAudio():Audio Error: " + err);
	        }
	    );
	    // Play audio
	    my_media.play();
  	}


  	/**
  	 * Attempts to upload our temporary file to SFDC, using the implementation in
  	 *   the McrestService. Note this is just basic example behaviour.
  	 */
  	function uploadFile() {
  		// fileUpload.uploadFileToUrl(file);
  		$ionicLoading.show({
				template: 'Uploading to SDFC',
				animation: 'fade-in',
				showBackdrop: true,
				duration: 15000
			});
			McRestService.upload(vm.file).then(function(result){
				console.log("restCall result", result);
				vm.uploadPath = result.url;
	          $scope.$apply();
				$ionicLoading.hide();
			}).catch(function(e){
				logger.error("restCall error",e);
			});
  	}


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
  	function playRemote(myfile, idx) {
  		console.log("playRemote");
  		if ( myfile.downloaded ) {
  			playCapture(myfile.id + ".amr");
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
						playCapture(myfile.id + ".amr");
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
				    dirEntry.getFile(myfile.id + ".amr", {create: true, exclusive: false},
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
  }

})();