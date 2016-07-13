'use strict';

var errorModel = require('../../../errors/index.js').errorModel;

var config = require('../../../config');
var logger = config.logger;
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");

module.exports.quotasGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/

    logger.ctlState("New request to GET quotas");
    var agreementId = args.agreement.value;
    var quotaId = args.quota.value;

    stateManager({id: agreementId}).then((manager) => {

        manager.get('quotas', { quota: quotaId }).then((quotas)=>{
            res.json(quotas);
        }, (err)=>{
            logger.error(err.message.toString());
            res.status(err.code).json(err);
        });

    }, (err) => {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}

module.exports.quotasQuotaPOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * quota (String)
     **/
     logger.ctlState("New request to GET quotas");
     var agreementId = args.agreement.value;
     var quotaId = args.quota.value;
     var query = args.query.value;
     query.quota = quotaId;
     stateManager({id: agreementId}).then((manager) => {

         manager.get('quotas', query).then((quotas)=>{

             res.json(quotas.map((element)=>{
               return manager.current(element);
             }));

         }, (err)=>{
             logger.error(err.message.toString());
             res.status(err.code).json(err);
         });

     }, (err) => {
         logger.error(err.message.toString());
         res.status(err.code).json(err);
     });

}
