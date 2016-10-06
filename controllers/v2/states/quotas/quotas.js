'use strict';

var config = require('../../../../config');
var logger = config.logger;
var stateManager = require('../../../../stateManager/stateManager.js');

/**
 * Quotas state module.
 * @module quotas
 * @see module:states
 * @requires config
 * @requires stateManager
 * */

module.exports = {
    quotasGET: _quotasGET,
    quotasQuotaGET: _quotasIdGET
};

/** 
 * Get all quotas
 * @param {object} args Object properties: agreement (String)
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:quotas.quotasGET
 * */
function _quotasGET(args, res, next) {
    logger.info("New request to GET quotas");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("quotas", function (quotas) {
        res.json(quotas);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}

/** 
 * Get quotas by ID
 * @param {object} args Object properties: agreement (String), quota (string)
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:quotas.quotasQuotaGET
 * */
function _quotasIdGET(args, res, next) {
    logger.info("New request to GET quota");
    var agreementId = args.agreement.value;
    var quotaId = args.quota.value;

    stateManager({
        id: agreementId
    }).get("quotas", {
        id: quotaId
    }, function (quota) {
        res.json(quota);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}