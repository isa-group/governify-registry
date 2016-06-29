'use strict';

var request = require('request');
var config = require('../config');
var example = require('../data');

// Requiring states controllers
var states = require("./states/states.js");

// Agreement controllers

exports.statesAgreementGET = states.agreements.agreementIdGET;

// Guarantees controllers

exports.statesAgreementGuaranteesGET = states.guarantees.guaranteesGET;

exports.statesAgreementGuaranteesGuaranteeGET = states.guarantees.guaranteeIdGET;

// Quotas controllers

exports.statesAgreementQuotasGET = states.quotas.quotasGET;

exports.statesAgreementQuotasQuotaGET = states.quotas.quotasQuotaGET;

// Rates controllers

exports.statesAgreementRatesGET = states.rates.ratesGET;

exports.statesAgreementRatesRateGET = states.rates.ratesRateGET;

// Metrics controllers

exports.statesAgreementMetricsGET = states.metrics.metricsGET;

exports.statesAgreementMetricsMetricGET = states.metrics.metricsIdGET;

exports.statesAgreementMetricsMetricPUT = states.metrics.metricsIdPUT;


exports.statesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   **/
  res.end();
}

exports.statesAgreementPricingGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {};
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}