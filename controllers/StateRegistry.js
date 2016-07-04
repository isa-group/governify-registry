'use strict';

var url = require('url');


var Stateregistry = require('./StateRegistryService');


module.exports.statesAgreementGET = function statesAgreementGET (req, res, next) {
  Stateregistry.statesAgreementGET(req.swagger.params, res, next);
};

module.exports.statesAgreementDELETE = function statesAgreementDELETE (req, res, next) {
  Stateregistry.statesAgreementDELETE(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGET = function statesAgreementGuaranteesGET (req, res, next) {
  Stateregistry.statesAgreementGuaranteesGET(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGuaranteeGET = function statesAgreementGuaranteesGuaranteeGET (req, res, next) {
  Stateregistry.statesAgreementGuaranteesGuaranteeGET(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsPOST = function statesAgreementMetricsPOST (req, res, next) {
  Stateregistry.statesAgreementMetricsPOST(req, res, next);
};

module.exports.statesAgreementMetricsMetricPOST = function statesAgreementMetricsMetricPOST (req, res, next) {
  Stateregistry.statesAgreementMetricsMetricPOST(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricHistoryPOST = function statesAgreementMetricsMetricHistoryPOST (req, res, next) {
  Stateregistry.statesAgreementMetricsMetricHistoryPOST(req.swagger.params, res, next);
};


module.exports.statesAgreementMetricsMetricPUT = function statesAgreementMetricsMetricPUT (req, res, next) {
  Stateregistry.statesAgreementMetricsMetricPUT(req.swagger.params, res, next);
};

module.exports.statesAgreementPricingGET = function statesAgreementPricingGET (req, res, next) {
  Stateregistry.statesAgreementPricingGET(req.swagger.params, res, next);
};

module.exports.statesAgreementPricingBillingPenaltiesPOST = function statesAgreementPricingBillingPenaltiesPOST (req, res, next) {
  Stateregistry.statesAgreementPricingBillingPenaltiesPOST(req, res, next);
};

module.exports.statesAgreementQuotasGET = function statesAgreementQuotasGET (req, res, next) {
  Stateregistry.statesAgreementQuotasGET(req.swagger.params, res, next);
};

module.exports.statesAgreementQuotasQuotaGET = function statesAgreementQuotasQuotaGET (req, res, next) {
  Stateregistry.statesAgreementQuotasQuotaGET(req.swagger.params, res, next);
};

module.exports.statesAgreementQuotasQuotaPUT = function statesAgreementQuotasQuotaPUT (req, res, next) {
  Stateregistry.statesAgreementQuotasQuotaPUT(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesGET = function statesAgreementRatesGET (req, res, next) {
  Stateregistry.statesAgreementRatesGET(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesRateGET = function statesAgreementRatesRateGET (req, res, next) {
  Stateregistry.statesAgreementRatesRateGET(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesRatePUT = function statesAgreementRatesRatePUT (req, res, next) {
  Stateregistry.statesAgreementRatesRatePUT(req.swagger.params, res, next);
};

module.exports.statesGET = function statesGET (req, res, next) {
  Stateregistry.statesGET(req.swagger.params, res, next);
};

module.exports.statesDELETE = function statesGET (req, res, next) {
  Stateregistry.statesDELETE(req.swagger.params, res, next);
};
