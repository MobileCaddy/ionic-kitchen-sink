/**
 * starter.controllers module
 *
 * @description defines starter.controllers module
 */
(function() {
  'use strict';

  angular.module('starter.controllers', ['ionic'])
      .directive('file', function() {
          return {
            restrict: 'AE',
            scope: {
              file: '='
            },
            link: function(scope, el, attrs){
              el.bind('change', function(event){
                var files = event.target.files;
                var file = files[0];
                if(file.size>0){
                  scope.file = file;
                } else {
                  scope.file = {};
                }
                scope.$apply();
              });
            }
          };
        })

      .directive('mcSyncSpinner', function(SyncService, NetworkService, $window) {
        return {
          restrict: 'E',
          scope: {},
          link: function(scope){
            var curSyncState = SyncService.getSyncState();
            if (curSyncState == 'Complete' || curSyncState ==  "InitialLoadComplete") {
              var networkState = NetworkService.getNetworkStatus();
              scope.syncState = networkState;
            } else {
              scope.syncState = "syncing";
            }

            var deregisterHandleSyncTables = scope.$on('syncTables', function(event, args) {
              if (args && args.result) {
                var syncInfo = args.result.toString();
                console.log("syncInfo", syncInfo);
                if (syncInfo == 'Complete' || syncInfo ==  "InitialLoadComplete") {
                  var networkState = NetworkService.getNetworkStatus();
                  scope.syncState = networkState;
                  scope.$apply();
                } else if (scope.syncState !== "syncing") {
                  console.log("scope.syncState = 'syncing'");
                  scope.syncState = "syncing";
                  scope.$apply();
                } else {
                  console.log("scope.syncState == 'syncing'");
                }
              }
            });

            var deregisterHandleNetworkState = scope.$on('networkState', function(event, args) {
              var networkState = args.state.toString();
              console.log("networkState", networkState);
              scope.syncState = networkState;
              scope.$apply();
            });

            scope.$on('$destroy',
                deregisterHandleSyncTables,
                deregisterHandleNetworkState
            );
          },
          templateUrl: $window.RESOURCE_ROOT + 'templates/mcSyncSpinner.html'
        };
      });

})();

