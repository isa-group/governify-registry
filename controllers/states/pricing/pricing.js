'use strict';

var config = require('../../../config');
var logger = config.logger;
var iso8601 = require('iso8601');
var Promise = require("bluebird");

module.exports.PricingBillingPenaltiePOST = function (req, res, next){
      var args = req.swagger.params;
      var agreementId = args.agreementId.value;
      var query = args.query.value;

      logger.info("New request to get pricing state for agreementId = " + agreementId);

      res.json(args);
}
