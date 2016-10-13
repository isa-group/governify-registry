'use strict';

var config = require('../../config');
var logger = config.logger;
var errorModel = require('../../errors/index.js').errorModel;

var Promise = require('bluebird');


/**
 * Quotas calculator module.
 * @module quotasCalculator
 * @requires config
 * @requires errors
 * @requires bluebird
 * @see module:calculators
 * */
module.exports = {
    process: processQuotas
};

/**
 * Process all quotas for a given query.
 * @param {Object} stateManager stateManager
 * @param {String} query query
 * @alias module:quotasCalculator.process
 * */
function processQuotas(stateManager, query) {
    return new Promise(function (resolve, reject) {
        logger.quotas("Calculating quotas for query = " + JSON.stringify(query, null, 2));

        var agreement = stateManager.agreement;

        var quotaDef = null;
        for (var q in agreement.term.quotas) {
            var indexQuota = agreement.term.quotas[q];
            if (indexQuota.id === query.quota) {
                quotaDef = indexQuota;
            }
        }
        if (!quotaDef) {
            logger.error("Not found quota for id = %s", query.quotas);
            return reject(new errorModel(404, "Not found quota for id = %s", query.quotas));
        }
        var overId = Object.keys(quotaDef.over)[0];
    });

}
