'use strict';

var request = require('request');
var config = require('../config');
var example = require('../data');

// Requiring states controllers
var states = require("./states/states.js");

var logger = config.logger;

module.exports = {
    statesDELETE: _statesDELETE,
// Agreement controllers

    statesAgreementGET: states.agreements.agreementIdGET,
    statesAgreementDELETE: states.agreements.agreementIdDELETE,
// Guarantees controllers

    statesAgreementGuaranteesGET: states.guarantees.guaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: states.guarantees.guaranteeIdGET,
// Quotas controllers

    statesAgreementQuotasGET: states.quotas.quotasGET,
    statesAgreementQuotasQuotaGET: states.quotas.quotasQuotaGET,
// Rates controllers

    statesAgreementRatesGET: states.rates.ratesGET,
    statesAgreementRatesRateGET: states.rates.ratesRateGET,
// Metrics controllers

    statesAgreementMetricsPOST: states.metrics.metricsPOST,
    statesAgreementMetricsMetricPOST: states.metrics.metricsIdPOST,
    statesAgreementMetricsMetricPUT: states.metrics.metricsIdPUT

};



function statesGET(args, res, next) {
    /**
     * parameters expected in the args:
     **/
    res.end();
}

function _statesDELETE(args, res, next) {
    logger.info("New request to DELETE all agreement states");
    var StateModel = config.db.models.StateModel;
    StateModel.remove(function (err) {
        if (!err) {
            res.sendStatus(200);
            logger.info("Deleted state for all agreements");
        } else {
            res.sendStatus(404);
            logger.warning("Can't delete state for all agreements: " + err);
        }
    });
}

function statesAgreementPricingGET(args, res, next) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

}

var statesAgreementPricingBillingPenaltiePOST = states.pricing.PricingBillingPenaltiePOST;
