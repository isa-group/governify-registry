'use strict';

/**
 * States module.
 * @module states
 */
module.exports = {
    /** 
     * Whole agreement state.
     * @see module:agreements
     * */
    agreements: require("./agreements/agreements.js"),
    /** 
     * Guaranteest state.
     * @see module:guarantees
     * */
    guarantees: require("./guarantees/guarantees.js"),
    /** 
     * Quotas state.
     * @see module:quotas
     * */
    quotas: require("./quotas/quotas.js"),
    /** 
     * Rates state.
     * @see module:rates
     * */
    rates: require("./rates/rates.js"),
    /** 
     * Metrics state.
     * @see module:metrics
     * */
    metrics: require("./metrics/metrics.js"),
    /** 
     * Pricing state.
     * @see module:pricing
     * */
    pricing: require("./pricing/pricing.js")
};