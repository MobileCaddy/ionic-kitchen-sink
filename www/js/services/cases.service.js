/**
 * Cases Factory
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('CasesService', CasesService);

  CasesService.$inject = ['devUtils', 'logger', 'SyncService'];

  function CasesService(devUtils, logger, SyncService) {

  	var logTag = "app.CasesService",
  			caseTable = 'Case__ap';

  	return {
  		all: all,

  		get: get,

  		insert: insert
	  };

		/**
     * @description Gets a list of cases.
     * @return {promise} - resolves to an array of records or rejects.
     *                     rejects "sync-not-complete" | errorObj
    */
	  function all() {
	  	return new Promise(function(resolve, reject) {
				devUtils.readRecords(caseTable, []).then(function(resObject) {
					resolve(resObject.records.reverse());
				}).catch(function(resObject){
        	logger.error(logTag, "all", e);
					reject(resObject);
				});
     });
	  }


	  /**
	   * @function get
	   * @description Gets an case by it's ID
	   * @param  {string} id Id of our case
	   * @return {promise}    resolves to an case object
	   */
	  function get(id){
	  	return new Promise(function(resolve, reject) {
        var smartSql = "SELECT * from {" + caseTable + "} WHERE {" + caseTable + ":Id} = '" + id + "'";
        devUtils.smartSql(smartSql).then( function(resObject) {
          resolve(resObject.records[0]);
        }).catch(function(resObject){
        	logger.error(logTag, "get", e);
          reject(resObject);
        });
      });
	  }


  	/**
     * @function insert
     * @description Inserts a Case, through the MobileCaddy API. Following
     *              a successful insert it also calls a sync to SFDC.
     * @param {object} c Our contact object
     * @return {promise} Resolves to a success, or rejects an error object3
     */
	  function insert(myCase) {
	  	return new Promise(function(resolve, reject) {
	  		// Give it a temporary case number - will be overwritten by platform's autonumber
        myCase.CaseNumber = 'TMP-' + Date.now();

        devUtils.insertRecord(caseTable, myCase).then(function(resObject){
        	SyncService.syncTables([{'Name': caseTable}]);
        	resolve(resObject);
        }).catch(function(e){
        	logger.error(logTag, "insert", e);
        	reject(e);
        });
	  	});
	  }
  }

})();