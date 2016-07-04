'use strict';

var url = require('url');
var utils = require('../utils/utils');

var Agreement = require('./AgreementRegistryService');

module.exports.agreementsAgreementContextDefinitionsGET = function agreementsAgreementContextDefinitionsGET (req, res, next) {
  Agreement.agreementsAgreementContextDefinitionsGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextDefinitionsLogsGET = function agreementsAgreementContextDefinitionsLogsGET (req, res, next) {
  Agreement.agreementsAgreementContextDefinitionsLogsGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextDefinitionsSchemasGET = function agreementsAgreementContextDefinitionsSchemasGET (req, res, next) {
  Agreement.agreementsAgreementContextDefinitionsSchemasGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextDefinitionsScopesGET = function agreementsAgreementContextDefinitionsScopesGET (req, res, next) {
  Agreement.agreementsAgreementContextDefinitionsScopesGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextGET = function agreementsAgreementContextGET (req, res, next) {
  Agreement.agreementsAgreementContextGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextInfrastructureGET = function agreementsAgreementContextInfrastructureGET (req, res, next) {
  Agreement.agreementsAgreementContextInfrastructureGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementContextValidityGET = function agreementsAgreementContextValidityGET (req, res, next) {
  Agreement.agreementsAgreementContextValidityGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementGET = function agreementsAgreementGET (req, res, next) {
  Agreement.agreementsAgreementGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementDELETE = function agreementsAgreementDELETE (req, res, next) {
  Agreement.agreementsAgreementDELETE(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsGET = function agreementsAgreementTermsGET (req, res, next) {
  Agreement.agreementsAgreementTermsGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsGuaranteesGET = function agreementsAgreementTermsGuaranteesGET (req, res, next) {
  Agreement.agreementsAgreementTermsGuaranteesGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsGuaranteesGuaranteeGET = function agreementsAgreementTermsGuaranteesGuaranteeGET (req, res, next) {
  Agreement.agreementsAgreementTermsGuaranteesGuaranteeGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsMetricsGET = function agreementsAgreementTermsMetricsGET (req, res, next) {
  Agreement.agreementsAgreementTermsMetricsGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsMetricsMetricGET = function agreementsAgreementTermsMetricsMetricGET (req, res, next) {
  Agreement.agreementsAgreementTermsMetricsMetricGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingBillingGET = function agreementsAgreementTermsPricingBillingGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingBillingGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingBillingPenaltiesGET = function agreementsAgreementTermsPricingBillingPenaltiesGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingBillingPenaltiesGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET = function agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingBillingRewardsGET = function agreementsAgreementTermsPricingBillingRewardsGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingBillingRewardsGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingBillingRewardsRewardGET = function agreementsAgreementTermsPricingBillingRewardsRewardGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingBillingRewardsRewardGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsPricingGET = function agreementsAgreementTermsPricingGET (req, res, next) {
  Agreement.agreementsAgreementTermsPricingGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsQuotasGET = function agreementsAgreementTermsQuotasGET (req, res, next) {
  Agreement.agreementsAgreementTermsQuotasGET(req.swagger.params, res, next);
};

module.exports.agreementsAgreementTermsRatesGET = function agreementsAgreementTermsRatesGET (req, res, next) {
  Agreement.agreementsAgreementTermsRatesGET(req.swagger.params, res, next);
};

module.exports.agreementsGET = function agreementsGET (req, res, next) {
  Agreement.agreementsGET(req.swagger.params, res, next);
};

module.exports.agreementsDELETE = function agreementsDELETE (req, res, next) {
  Agreement.agreementsDELETE(req.swagger.params, res, next);
};

module.exports.agreementsPOST = function agreementsPOST (req, res, next) {
  Agreement.agreementsPOST(req.swagger.params, res, next);
};
