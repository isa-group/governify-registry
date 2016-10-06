'use strict';

var Agreement = require('./AgreementRegistryService');


/**
 * Registry agreement module.
 * @module AgreementRegistry
 * @see module:AgreementRegistryService
 * @see module:agreements
 * @requires AgreementRegistryService
 * */
module.exports = {
    agreementsAgreementContextDefinitionsGET: _agreementsAgreementContextDefinitionsGET,
    agreementsAgreementContextDefinitionsLogsGET: _agreementsAgreementContextDefinitionsLogsGET,
    agreementsAgreementContextDefinitionsSchemasGET: _agreementsAgreementContextDefinitionsSchemasGET,
    agreementsAgreementContextDefinitionsScopesGET: _agreementsAgreementContextDefinitionsScopesGET,
    agreementsAgreementContextGET: _agreementsAgreementContextGET,
    agreementsAgreementContextInfrastructureGET: _agreementsAgreementContextInfrastructureGET,
    agreementsAgreementContextValidityGET: _agreementsAgreementContextValidityGET,
    agreementsAgreementGET: _agreementsAgreementGET,
    agreementsAgreementDELETE: _agreementsAgreementDELETE,
    agreementsAgreementTermsGET: _agreementsAgreementTermsGET,
    agreementsAgreementTermsGuaranteesGET: _agreementsAgreementTermsGuaranteesGET,
    agreementsAgreementTermsGuaranteesGuaranteeGET: _agreementsAgreementTermsGuaranteesGuaranteeGET,
    agreementsAgreementTermsMetricsGET: _agreementsAgreementTermsMetricsGET,
    agreementsAgreementTermsMetricsMetricGET: _agreementsAgreementTermsMetricsMetricGET,
    agreementsAgreementTermsPricingBillingGET: _agreementsAgreementTermsPricingBillingGET,
    agreementsAgreementTermsPricingBillingPenaltiesGET: _agreementsAgreementTermsPricingBillingPenaltiesGET,
    agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET: _agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET,
    agreementsAgreementTermsPricingBillingRewardsGET: _agreementsAgreementTermsPricingBillingRewardsGET,
    agreementsAgreementTermsPricingBillingRewardsRewardGET: _agreementsAgreementTermsPricingBillingRewardsRewardGET,
    agreementsAgreementTermsPricingGET: _agreementsAgreementTermsPricingGET,
    agreementsAgreementTermsQuotasGET: _agreementsAgreementTermsQuotasGET,
    agreementsAgreementTermsRatesGET: _agreementsAgreementTermsRatesGET,
    agreementsGET: _agreementsGET,
    agreementsDELETE: _agreementsDELETE,
    agreementsPOST: _agreementsPOST
};

/** 
 * agreementsAgreementContextDefinitionsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextDefinitionsGET
 * */
function _agreementsAgreementContextDefinitionsGET(req, res, next) {
    Agreement.agreementsAgreementContextDefinitionsGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextDefinitionsLogsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextDefinitionsLogsGET
 * */
function _agreementsAgreementContextDefinitionsLogsGET(req, res, next) {
    Agreement.agreementsAgreementContextDefinitionsLogsGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextDefinitionsSchemasGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextDefinitionsSchemasGET
 * */
function _agreementsAgreementContextDefinitionsSchemasGET(req, res, next) {
    Agreement.agreementsAgreementContextDefinitionsSchemasGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextDefinitionsScopesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextDefinitionsScopesGET
 * */
function _agreementsAgreementContextDefinitionsScopesGET(req, res, next) {
    Agreement.agreementsAgreementContextDefinitionsScopesGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextGET
 * */
function _agreementsAgreementContextGET(req, res, next) {
    Agreement.agreementsAgreementContextGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextInfrastructureGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextInfrastructureGET
 * */
function _agreementsAgreementContextInfrastructureGET(req, res, next) {
    Agreement.agreementsAgreementContextInfrastructureGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementContextValidityGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementContextValidityGET
 * */
function _agreementsAgreementContextValidityGET(req, res, next) {
    Agreement.agreementsAgreementContextValidityGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementGET
 * */
function _agreementsAgreementGET(req, res, next) {
    Agreement.agreementsAgreementGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementDELETE
 * */
function _agreementsAgreementDELETE(req, res, next) {
    Agreement.agreementsAgreementDELETE(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsGET
 * */
function _agreementsAgreementTermsGET(req, res, next) {
    Agreement.agreementsAgreementTermsGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsGuaranteesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsGuaranteesGET
 * */
function _agreementsAgreementTermsGuaranteesGET(req, res, next) {
    Agreement.agreementsAgreementTermsGuaranteesGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsGuaranteesGuaranteeGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsGuaranteesGuaranteeGET
 * */
function _agreementsAgreementTermsGuaranteesGuaranteeGET(req, res, next) {
    Agreement.agreementsAgreementTermsGuaranteesGuaranteeGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsMetricsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsMetricsGET
 * */
function _agreementsAgreementTermsMetricsGET(req, res, next) {
    Agreement.agreementsAgreementTermsMetricsGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsMetricsMetricGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsMetricsMetricGET
 * */
function _agreementsAgreementTermsMetricsMetricGET(req, res, next) {
    Agreement.agreementsAgreementTermsMetricsMetricGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingBillingGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingBillingGET
 * */
function _agreementsAgreementTermsPricingBillingGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingBillingGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingBillingPenaltiesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingBillingPenaltiesGET
 * */
function _agreementsAgreementTermsPricingBillingPenaltiesGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingBillingPenaltiesGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET
 * */
function _agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingBillingRewardsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingBillingRewardsGET
 * */
function _agreementsAgreementTermsPricingBillingRewardsGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingBillingRewardsGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingBillingRewardsRewardGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingBillingRewardsRewardGET
 * */
function _agreementsAgreementTermsPricingBillingRewardsRewardGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingBillingRewardsRewardGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsPricingGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsPricingGET
 * */
function _agreementsAgreementTermsPricingGET(req, res, next) {
    Agreement.agreementsAgreementTermsPricingGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsQuotasGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsQuotasGET
 * */
function _agreementsAgreementTermsQuotasGET(req, res, next) {
    Agreement.agreementsAgreementTermsQuotasGET(req.swagger.params, res, next);
}


/** 
 * agreementsAgreementTermsRatesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsAgreementTermsRatesGET
 * */
function _agreementsAgreementTermsRatesGET(req, res, next) {
    Agreement.agreementsAgreementTermsRatesGET(req.swagger.params, res, next);
}


/** 
 * agreementsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsGET
 * */
function _agreementsGET(req, res, next) {
    Agreement.agreementsGET(req.swagger.params, res, next);
}


/** 
 * agreementsDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsDELETE
 * */
function _agreementsDELETE(req, res, next) {
    Agreement.agreementsDELETE(req.swagger.params, res, next);
}


/** 
 * agreementsPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:AgreementRegistry.agreementsPOST
 * */
function _agreementsPOST(req, res, next) {
    Agreement.agreementsPOST(req.swagger.params, res, next);
}