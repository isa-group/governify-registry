'use strict';

/**
 * Calculators module.
 * @module calculators
 * */
module.exports = {
     /** 
     * Agreement calculator.
     * @see module:agreementCalculator
     * */
    agreementCalculator: require('./agreementCalculator.js'),
    /** 
     * Guarantee calculator.
     * @see module:guaranteeCalculator
     * */
    guaranteeCalculator: require('./guaranteeCalculator.js'),
    /** 
     * Metric calculator.
     * @see module:metricCalculator
     * */
    metricCalculator: require('./metricCalculator.js'),
    /** 
     * Pricing calculator.
     * @see module:pricingCalculator
     * */
    pricingCalculator: require('./pricingCalculator.js')
};