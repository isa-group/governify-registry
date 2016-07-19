'use strict';

var errorModel = require('../../../errors/index.js').errorModel;

var config = require('../../../config');
var logger = config.logger;
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");

module.exports.ratesPOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
     logger.ctlState("New request to GET rates");
     var agreementId = args.agreement.value;
     var query = args.query.value
     stateManager({id: agreementId}).then((manager) => {
         var ret = [];
         Promise.each(manager.agreement.terms.rates, (rateDef)=>{
             var rateId = rateDef.id;
             return manager.get('rates', { rate: rateId, scope: query.scope }).then((rates)=>{
                 rates.forEach((element)=>{
                     ret.push(element);
                 });
             }, (err)=>{
                 logger.error(err.message.toString());
                 return res.status(err.code).json(err);
             });
         }).then((success)=>{
             return res.json(ret.map((element)=>{
                 return manager.current(element);
             }));
         }, (err)=>{
             logger.error(err.message.toString());
             return res.status(err.code).json(err);
         });

     }, (err) => {
         logger.error(err.message.toString());
         res.status(err.code).json(err);
     });

}

module.exports.ratesRatePOST = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * rate (String)
     **/

     logger.ctlState("New request to GET rate");
     var agreementId = args.agreement.value;
     var rateId = args.rate.value;
     var query = args.query.value;
     query.rate = rateId;
     stateManager({id: agreementId}).then((manager) => {

         manager.get('rates', query).then((rates)=>{

             res.json(rates.map((element)=>{
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
