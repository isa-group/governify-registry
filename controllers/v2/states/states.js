'use strict';

/**
 * States module.
 * @module states
 * @see module:StateRegistry
 * @see module:StateRegistryService
 */
module.exports = {
    /** 
     * Whole agreement state.
     * @see module:agreementsState
     * */
    agreements: require("./agreements/agreements.js"),
    /** 
     * Guaranteest state.
     * @see module:agreementsState
     * */
    guarantees: require("./guarantees/guarantees.js"),
    /** 
     * Quotas state.
     * @see module:agreementsState
     * */
    quotas: require("./quotas/quotas.js"),
    /** 
     * Rates state.
     * @see module:agreementsState
     * */
    rates: require("./rates/rates.js"),
    /** 
     * Metrics state.
     * @see module:agreementsState
     * */
    metrics: require("./metrics/metrics.js"),
    /** 
     * Pricing state.
     * @see module:agreementsState
     * */
    pricing: require("./pricing/pricing.js")
};