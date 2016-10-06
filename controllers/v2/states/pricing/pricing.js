'use strict';

var config = require('../../../../config');
var logger = config.logger;
var stateManager = require('../../../../stateManager/stateManager.js');

/**
 * Pricing state module.
 * @module pricing
 * @see module:pricing
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    PricingBillingPenaltiesPOST: _PricingBillingPenaltiesPOST
};

/** 
 * Post pricing billing penalties
 * @param {object} req request
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:pricing.PricingBillingPenaltiesPOST
 * */
function _PricingBillingPenaltiesPOST(req, res, next) {
    var args = req.swagger.params;

    logger.warning(JSON.stringify(args));
    var agreementId = args.agreement.value;
    var query = args.query.value;
    logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

    stateManager({id: agreementId}).then(function (manager) {
        manager.get('pricing', query).then(function (data) {

            logger.ctlState("Sending Pricing-Billing-Penalties state");
            res.json(data);

        }, function (err) {
            logger.ctlState("ERROR: " + err.message);
            res.status(err.code).json(err);
        });
    }, function (err) {
        logger.ctlState("ERROR: " + err.message);
        res.status(err.code).json(err);
    });
}
