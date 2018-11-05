'use strict';

var request = require('request');
var config = require('../config');

// Requiring states controllers
var states = require("./states/states.js");

var logger = config.logger;

module.exports = {
    // Agreement controllers

    statesAgreementGET: states.agreements.agreementIdGET,
    statesAgreementDELETE: states.agreements.agreementIdDELETE,
    statesAgreementRELOAD: states.agreements.agreementIdRELOAD,

    // Guarantees controllers

    statesAgreementGuaranteesGET: states.guarantees.guaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: states.guarantees.guaranteeIdGET,
    statesAgreementGuaranteesGuaranteePenaltiyPOST: states.guarantees.guaranteeIdPenaltyPOST,

    // Quotas controllers

    statesAgreementQuotasPOST: states.quotas.quotasPOST,
    statesAgreementQuotasQuotaPOST: states.quotas.quotasQuotaPOST,
    // Rates controllers

    statesAgreementRatesPOST: states.rates.ratesPOST,
    statesAgreementRatesRatePOST: states.rates.ratesRatePOST,
    // Metrics controllers

    statesAgreementMetricsPOST: states.metrics.metricsPOST,
    statesAgreementMetricsMetricPOST: states.metrics.metricsIdPOST,
    statesAgreementMetricsMetricPUT: states.metrics.metricsIdPUT,
    statesAgreementMetricsMetricIncreasePOST: states.metrics.metricsIdIncrease,

    // Pricing
    statesAgreementPricingBillingPenaltiesPOST: states.pricing.PricingBillingPenaltiesPOST,

    // Delete
    statesDELETE: _statesDELETE,
};

function _statesDELETE(args, res, next) {
    logger.ctlState("New request to DELETE all agreement states");
    var StateModel = config.db.models.StateModel;
    StateModel.remove(function(err) {
        if (!err) {
            res.sendStatus(200);
            logger.info("Deleted state for all agreements");
        } else {
            res.sendStatus(404);
            logger.warning("Can't delete state for all agreements: " + err);
        }
    });
}
