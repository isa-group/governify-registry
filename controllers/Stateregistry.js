'use strict';

var url = require('url');


var Stateregistry = require('./StateregistryService');


module.exports.statesAgreementGET = function statesAgreementGET (req, res, next) {
  Stateregistry.statesAgreementGET(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGET = function statesAgreementGuaranteesGET (req, res, next) {
  Stateregistry.statesAgreementGuaranteesGET(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGuaranteeGET = function statesAgreementGuaranteesGuaranteeGET (req, res, next) {
  Stateregistry.statesAgreementGuaranteesGuaranteeGET(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsGET = function statesAgreementMetricsGET (req, res, next) {
  Stateregistry.statesAgreementMetricsGET(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricGET = function statesAgreementMetricsMetricGET (req, res, next) {
  Stateregistry.statesAgreementMetricsMetricGET(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricPUT = function statesAgreementMetricsMetricPUT (req, res, next) {
  Stateregistry.statesAgreementMetricsMetricPUT(req.swagger.params, res, next);
};

module.exports.statesAgreementPricingGET = function statesAgreementPricingGET (req, res, next) {
  Stateregistry.statesAgreementPricingGET(req.swagger.params, res, next);
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
