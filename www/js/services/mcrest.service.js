/**
 * MobileCaddyForce Factory
 *
 * @description Service for calling generic Salesforce REST endpoints.
 *              When running in Codeflow it uses the forcejs, otherwise we call
 *              using the $http service.
 * sync status.
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('McRestService', McRestService);

  McRestService.$inject = ['devUtils', 'logger', '$http'];

  function McRestService(devUtils, logger, $http) {

    var logModule = "app.McRestService";
    var oauth;

    return {
      request: request,

      upload: upload
    };


    /**
     * Sets up our oauth object from the appSoup. We should only need to do this
     * every now and again as it's a singleton.
     * TODO - Clear this if the call fails as we want to re-pull from appSoup, for
     *        cases where accessToken has been refreshed
     */
    function setUpOauth() {
      return new Promise(function(resolve, reject) {
        devUtils.getCachedAppSoupValue('accessToken').then(function(accessToken){
          oauth = {'accessToken': accessToken};
          return devUtils.getCachedAppSoupValue('refreshToken');
        }).then(function(refreshToken){
          oauth.refreshToken = refreshToken;
          return devUtils.getCachedAppSoupValue('instanceUrl');
        }).then(function(instanceUrl){
          oauth.instanceUrl = instanceUrl;
          resolve();
        }).catch(function(e){
          oauth = null;
          logger.error(e);
          reject(e);
        });
      });
    }


    function request(obj) {
      if (! window.LOCAL_DEV) {
        if (!oauth) {
          setUpOauth().then(function(){
            return doRequest(obj);
          }).catch(function(e){
            logger.error(logModule, 'oauth setup failed', e);
            return Promise.reject(e);
          });
        } else {
          return doRequest(obj);
        }
      } else {
        // Use our already instatiated forcejs
        return forcejsRequest(obj);
      }
    }


    function upload(file) {
      if (! window.LOCAL_DEV) {
        if (!oauth) {
          setUpOauth().then(function(){
            return doUpload(file);
          }).catch(function(e){
            logger.error(logModule, 'oauth setup failed', e);
            return Promise.reject(e);
          });
        } else {
          return doUpload(file);
        }
      } else {
        // Use our already instatiated forcejs
         return forcejsUpload(file);
      }
    }


    function forcejsUpload(file) {
      return new Promise(function(resolve, reject) {
        console.log("upload");
        var uploadUrl  = 'http://localhost:3000' + '/services/data/v40.0/connect/files/users/me';
        var forceOauth = JSON.parse(localStorage.getItem('forceOAuth'));
        var headers = {'Content-Type': undefined, 'Target-URL':forceOauth.instance_url};
        headers.Authorization = "Bearer " + forceOauth.access_token;

        var fd = new FormData();
        fd.append('fileData', file);
        fd.append('desc', 'A file I want to upload');
        fd.append('title', 'My File'); // Note: if we live this blank it will take the local filename
        $http.post(uploadUrl, fd, {
           transformRequest: angular.identity,
           headers: headers
        })
        .success(function(res){
          console.log("success");
          resolve(res);
        })
        .error(function(e){
          console.error(e);
          reject(e);
        });
      });
    }

    function doUpload(file) {
      return new Promise(function(resolve, reject) {
        console.log("upload");
        var uploadUrl  = oauth.instanceUrl + '/services/data/v40.0/connect/files/users/me';

        var headers = {'Content-Type': undefined};
        headers.Authorization = "Bearer " + oauth.accessToken;

        var fd = new FormData();
        fd.append('fileData', file);
        fd.append('desc', 'A file I want to upload');
        fd.append('title', 'My File'); // Note: if we live this blank it will take the local filename
        $http.post(uploadUrl, fd, {
           transformRequest: angular.identity,
           headers: headers
        })
        .success(function(res){
          console.log("success");
          resolve(res);
        })
        .error(function(e){
          console.error(e);
          reject(e);
        });
      });
    }

    function forcejsRequest(obj) {
      return new Promise(function(resolve, reject) {
        force.request(obj,
          function(resp) {
            console.log(logModule, resp);
            resolve(resp);
          },
          function(e) {
            console.error(logModule, 'forcejs Failed',e);
            reject(e);
          }
        );
      });
    }

    function doRequest(obj){
      return new Promise(function(resolve, reject) {
        console.log(logModule, "oauth", oauth);
        var method = obj.method || 'GET',
            headers = {};

        // dev friendly API: Add leading '/' if missing so url + path concat always works
        if (obj.path.charAt(0) !== '/') {
          obj.path = '/' + obj.path;
        }

        var url = oauth.instanceUrl + obj.path;

        headers.Authorization = "Bearer " + oauth.accessToken;
        if (obj.contentType) {
          headers["Content-Type"] = obj.contentType;
        }
        console.log(logModule, "request headers: "+JSON.stringify(headers));
        console.log(logModule, "request url: "+url);

        $http({
          headers: headers,
          method: method,
          url: url,
          params: obj.params,
          data: obj.data
        }).success(function (data, status, headers, config) {
          resolve(data);
        }).error(function (data, status, headers, config) {
          // TODO - need to call code to refresh oauth
          logger.error(logModule, "$http error status", status);
          logger.error(logModule, "$http error headers", headers);
          logger.error(logModule, "$http error config", config);
          logger.error(logModule, "$http error data", data);
          reject(data);
        });
      });
    }

  }

})();
