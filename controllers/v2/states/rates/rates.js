'use strict';

var config = require('../../../../config');
var logger = config.logger;
var stateManager = require('../../../../stateManager/stateManager.js');


/**
 * Rates state module.
 * @module rates
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    ratesGET: _ratesGET,
    ratesRateGET: _ratesIdGET
};


/** 
 * Get all rates.
 * @param {object} args {agreement: String}
 * @param {object} res response
 * @param {object} next next function
 * @alias module:rates.ratesGET
 * */
function _ratesGET(args, res, next) {
    logger.info("New request to GET rates");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("rates", function (rates) {
        res.json(rates);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}


/** 
 * Get rates by ID.
 * @param {object} args {agreement: String, rate: String}
 * @param {object} res response
 * @param {object} next next function
 * @alias module:rates.ratesRateGET
 * */
function _ratesIdGET(args, res, next) {
    logger.info("New request to GET rate");
    var agreementId = args.agreement.value;
    var rateId = args.rate.value;

    stateManager({
        id: agreementId
    }).get("rates", {
        id: rateId
    }, function (rate) {
        res.json(rate);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}