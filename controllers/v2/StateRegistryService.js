'use strict';

var states = require("./states/states.js");


/**
 * Registry states service module.
 * @module StateRegistryService
 * @see module:states
 * @see module:StateRegistry
 * @requires states
 * */
module.exports = {
    /** agreementIdGET. */
    statesAgreementGET: states.agreements.agreementIdGET,
    /** agreementIdDELETE. */
    statesAgreementDELETE: states.agreements.agreementIdDELETE,
    /** agreementIdRELOAD. */
    statesAgreementRELOAD: states.agreements.agreementIdRELOAD,

    /** guaranteesGET. */
    statesAgreementGuaranteesGET: states.guarantees.guaranteesGET,
    /** guaranteeIdGET. */
    statesAgreementGuaranteesGuaranteeGET: states.guarantees.guaranteeIdGET,
    /** guaranteeIdPenaltyPOST. */
    statesAgreementGuaranteesGuaranteePenaltiyPOST: states.guarantees.guaranteeIdPenaltyPOST,
    
    /** quotasGET. */
    statesAgreementQuotasGET: states.quotas.quotasGET,
    /** quotasQuotaGET. */
    statesAgreementQuotasQuotaGET: states.quotas.quotasQuotaGET,

    /** ratesGET. */
    statesAgreementRatesGET: states.rates.ratesGET,
    /** ratesRateGET. */
    statesAgreementRatesRateGET: states.rates.ratesRateGET,

    /** metricsPOST. */
    statesAgreementMetricsPOST: states.metrics.metricsPOST,
    /** metricsIdPOST. */
    statesAgreementMetricsMetricPOST: states.metrics.metricsIdPOST,
    /** metricsIdPUT. */
    statesAgreementMetricsMetricPUT: states.metrics.metricsIdPUT,
    /** metricsIdIncrease. */
    statesAgreementMetricsMetricIncreasePOST: states.metrics.metricsIdIncrease,
    
    /** PricingBillingPenaltiesPOST. */
    statesAgreementPricingBillingPenaltiesPOST: states.pricing.PricingBillingPenaltiesPOST,
    
    /** statesDELETE. */
    statesDELETE: states.agreements.statesDELETE
};