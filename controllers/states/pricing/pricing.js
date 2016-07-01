'use strict';

var config = require('../../../config');
var logger = config.logger;
var iso8601 = require('iso8601');
var Promise = require("bluebird");
var errorModel = require('../../../errors/index.js').errorModel;
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");
var request = require("request");

module.exports.PricingBillingPenaltiePOST = function (req, res, next){
      var args = req.swagger.params;
      var agreementId = args.agreementId.value;
      var query = args.query.value;

      logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

      stateManager({id: agreementId}).then((manager)=>{
          manager.get('pricing', query).then((data)=>{

              logger.ctlState("Sending Pricing-Billing-Penalties state");
              res.json(data);

          }, (err) =>{
              logger.ctlState("ERROR: " + err.message );
              res.status(err.code).json(err);
          })
      }, (err) =>{
          logger.ctlState("ERROR: " + err.message );
          res.status(err.code).json(err);
      });
}
