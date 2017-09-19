/*!
governify-registry 3.0.0, built on: 2017-05-08
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var states = require('./states/states.js');

/**
 * Registry states module.
 * @module StateRegistry
 * @see module:StateRegistryService
 * @see module:states
 * @requires StateRegistryService
 * */
module.exports = {
    //Agreement
    statesAgreementGET: _statesAgreementGET,
    statesAgreementRELOAD: _statesAgreementRELOAD,
    statesAgreementDELETE: _statesAgreementDELETE,
    statesDELETE: _statesDELETE,
    //Guarantees
    statesAgreementGuaranteesGET: _statesAgreementGuaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: _statesAgreementGuaranteesGuaranteeGET,
    statesAgreementGuaranteesGuaranteePenaltiyGET: _statesAgreementGuaranteesGuaranteePenaltiyGET,
    //Metrics
    statesAgreementMetricsGET: _statesAgreementMetricsGET,
    statesAgreementMetricsMetricGET: _statesAgreementMetricsMetricGET,
    statesAgreementMetricsMetricIncreasePOST: _statesAgreementMetricsMetricIncreasePOST,
    statesAgreementMetricsMetricPOST: _statesAgreementMetricsMetricPOST,
    //Penalties
    statesAgreementPricingBillingPenaltiesPOST: _statesAgreementPricingBillingPenaltiesPOST,
    //Quotas
    statesAgreementQuotasGET: _statesAgreementQuotasGET,
    statesAgreementQuotasQuotaGET: _statesAgreementQuotasQuotaGET,
    //Rates
    statesAgreementRatesGET: _statesAgreementRatesGET,
    statesAgreementRatesRateGET: _statesAgreementRatesRateGET,
};


/** 
 * statesAgreementGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGET
 * */
function _statesAgreementGET(req, res, next) {
    states.agreements.agreementIdGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementDELETE
 * */
function _statesAgreementDELETE(req, res, next) {
    states.agreements.agreementIdDELETE(req.swagger.params, res, next);
}


/** 
 * statesAgreementRELOAD.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRELOAD
 * */
function _statesAgreementRELOAD(req, res, next) {
    states.agreements.agreementIdRELOAD(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGET
 * */
function _statesAgreementGuaranteesGET(req, res, next) {
    states.agreements.guaranteesGET(req, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteeGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteeGET
 * */
function _statesAgreementGuaranteesGuaranteeGET(req, res, next) {
    states.agreements.guaranteeIdGET(req, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteePenaltiyPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST
 * */
function _statesAgreementGuaranteesGuaranteePenaltiyGET(req, res, next) {
    states.guarantees.guaranteeIdPenaltyGET(req, res, next);
}


/** 
 * statesAgreementMetricsPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsPOST
 * */
function _statesAgreementMetricsGET(req, res, next) {
    states.metrics.metricsGET(req, res, next);
}


/** 
 * statesAgreementMetricsMetricPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPOST
 * */
function _statesAgreementMetricsMetricGET(req, res, next) {
    states.metrics.metricsIdGET(req, res, next);
}


/** 
 * statesAgreementMetricsMetricIncreasePOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricIncreasePOST
 * */
function _statesAgreementMetricsMetricIncreasePOST(req, res, next) {
    states.metrics.metricsIdIncrease(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPOST
 * */
function _statesAgreementMetricsMetricPOST(req, res, next) {
    states.metrics.metricsIdPOST(req.swagger.params, res, next);
}

/** 
 * statesAgreementPricingBillingPenaltiesPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementPricingBillingPenaltiesPOST
 * */
function _statesAgreementPricingBillingPenaltiesPOST(req, res, next) {
    states.pricing.PricingBillingPenaltiesPOST(req, res, next);
}


/** 
 * statesAgreementQuotasGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasGET
 * */
function _statesAgreementQuotasGET(req, res, next) {
    states.quotas.quotasGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementQuotasQuotaGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasQuotaGET
 * */
function _statesAgreementQuotasQuotaGET(req, res, next) {
    states.quotas.quotasQuotaGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRatesGET
 * */
function _statesAgreementRatesGET(req, res, next) {
    states.rates.ratesGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesRateGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRatesRateGET
 * */
function _statesAgreementRatesRateGET(req, res, next) {
    states.rates.ratesRateGET(req.swagger.params, res, next);
}

/** 
 * statesDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesDELETE
 * */
function _statesDELETE(req, res, next) {
    states.agreements.statesDELETE(req.swagger.params, res, next);
}