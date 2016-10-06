'use strict';

var StateRegistry = require('./StateRegistryService');


/**
 * Registry states module.
 * @module StateRegistry
 * @see module:StateRegistryService
 * @see module:states
 * @requires StateRegistryService
 * */
module.exports = {
    statesAgreementGET: _statesAgreementGET,
    statesAgreementDELETE: _statesAgreementDELETE,
    statesAgreementRELOAD: _statesAgreementRELOAD,
    statesAgreementGuaranteesGET: _statesAgreementGuaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: _statesAgreementGuaranteesGuaranteeGET,
    statesAgreementGuaranteesGuaranteePenaltiyPOST: _statesAgreementGuaranteesGuaranteePenaltiyPOST,
    statesAgreementMetricsPOST: _statesAgreementMetricsPOST,
    statesAgreementMetricsMetricPOST: _statesAgreementMetricsMetricPOST,
    statesAgreementMetricsMetricHistoryPOST: _statesAgreementMetricsMetricHistoryPOST,
    statesAgreementMetricsMetricIncreasePOST: _statesAgreementMetricsMetricIncreasePOST,
    statesAgreementMetricsMetricPUT: _statesAgreementMetricsMetricPUT,
    statesAgreementPricingGET: _statesAgreementPricingGET,
    statesAgreementPricingBillingPenaltiesPOST: _statesAgreementPricingBillingPenaltiesPOST,
    statesAgreementQuotasGET: _statesAgreementQuotasGET,
    statesAgreementQuotasQuotaGET: _statesAgreementQuotasQuotaGET,
    statesAgreementQuotasQuotaPUT: _statesAgreementQuotasQuotaPUT,
    statesAgreementRatesGET: _statesAgreementRatesGET,
    statesAgreementRatesRateGET: _statesAgreementRatesRateGET,
    statesAgreementRatesRatePUT: _statesAgreementRatesRatePUT,
    statesGET: _statesGET,
    statesDELETE: _statesDELETE
};


/** 
 * statesAgreementGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementGET
 * */
function _statesAgreementGET(req, res, next) {
    StateRegistry.statesAgreementGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementDELETE.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementDELETE
 * */
function _statesAgreementDELETE(req, res, next) {
    StateRegistry.statesAgreementDELETE(req.swagger.params, res, next);
}


/** 
 * statesAgreementRELOAD.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementRELOAD
 * */
function _statesAgreementRELOAD(req, res, next) {
    StateRegistry.statesAgreementRELOAD(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGET
 * */
function _statesAgreementGuaranteesGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteeGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteeGET
 * */
function _statesAgreementGuaranteesGuaranteeGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteeGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteePenaltiyPOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST
 * */
function _statesAgreementGuaranteesGuaranteePenaltiyPOST(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsPOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsPOST
 * */
function _statesAgreementMetricsPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsPOST(req, res, next);
}


/** 
 * statesAgreementMetricsMetricPOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPOST
 * */
function _statesAgreementMetricsMetricPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricHistoryPOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricHistoryPOST
 * */
function _statesAgreementMetricsMetricHistoryPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricHistoryPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricIncreasePOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricIncreasePOST
 * */
function _statesAgreementMetricsMetricIncreasePOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricIncreasePOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricPUT.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPUT
 * */
function _statesAgreementMetricsMetricPUT(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPUT(req.swagger.params, res, next);
}


/** 
 * statesAgreementPricingGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementPricingGET
 * */
function _statesAgreementPricingGET(req, res, next) {
    StateRegistry.statesAgreementPricingGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementPricingBillingPenaltiesPOST.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementPricingBillingPenaltiesPOST
 * */
function _statesAgreementPricingBillingPenaltiesPOST(req, res, next) {
    StateRegistry.statesAgreementPricingBillingPenaltiesPOST(req, res, next);
}


/** 
 * statesAgreementQuotasGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasGET
 * */
function _statesAgreementQuotasGET(req, res, next) {
    StateRegistry.statesAgreementQuotasGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementQuotasQuotaGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasQuotaGET
 * */
function _statesAgreementQuotasQuotaGET(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementQuotasQuotaPUT.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasQuotaPUT
 * */
function _statesAgreementQuotasQuotaPUT(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaPUT(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementRatesGET
 * */
function _statesAgreementRatesGET(req, res, next) {
    StateRegistry.statesAgreementRatesGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesRateGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementRatesRateGET
 * */
function _statesAgreementRatesRateGET(req, res, next) {
    StateRegistry.statesAgreementRatesRateGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesRatePUT.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesAgreementRatesRatePUT
 * */
function _statesAgreementRatesRatePUT(req, res, next) {
    StateRegistry.statesAgreementRatesRatePUT(req.swagger.params, res, next);
}


/** 
 * statesGET.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesGET
 * */
function _statesGET(req, res, next) {
    StateRegistry.statesGET(req.swagger.params, res, next);
}


/** 
 * statesDELETE.
 * @param {object} req request
 * @param {object} res response
 * @param {object} next next function
 * @alias module:StateRegistry.statesDELETE
 * */
function _statesDELETE(req, res, next) {
    StateRegistry.statesDELETE(req.swagger.params, res, next);
}
