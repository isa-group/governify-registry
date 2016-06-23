'use strict';

var agreementCalculator = require('../calculators/compensations/agreement/agreementCalculator');
var config = require('../config');
var example = require('../data');

//Requiring states controllers
var states = require("./states/states.js");

exports.statesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   **/
  res.end();
}

exports.statesAgreementGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
  res.setHeader('Content-Type', 'application/json');

  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': args.agreement.value
  }, function(err, agreement) {
    if (err) {
      res.end(JSON.stringify({
        code: 500,
        message: err
      }));
    }

    if (agreement.length === 1) {
      agreementCalculator.processCompensations(agreement[0], "20160116", "20160215")
        .then(function(compensations) {
          res.end(JSON.stringify(compensations));
        }, function(err) {
          console.log(err);
          res.end(JSON.stringify({
            code: 500,
            message: err
          }));
        });
    } else {
      res.end(JSON.stringify({
        code: 500,
        message: 'Error retrieving agreement from the database.'
      }));
    }
  });

}

exports.statesAgreementGuaranteesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * from (String)
   * to (String)
   **/

  var AgreementModel = config.db.models.agreement;
  AgreementModel.find({
    'id': args.agreement.value
  }, function(err, agreement) {
    if (err) {
      res.end(JSON.stringify({
        code: 500,
        message: err
      }));
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(agreement.terms.guarantees));
  });
}

exports.statesAgreementGuaranteesGuaranteeGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * guarantee (String)
   * from (String)
   * to (String)
   **/

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(example.filter(function(guarantee) {
    return guarantee.guarantee === args.guarantee.value
  })));
}

exports.statesAgreementMetricsGET = function(args, res, next) {
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

exports.statesAgreementMetricsMetricGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * metric (String)
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

exports.statesAgreementMetricsMetricPUT = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * metric (String)
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

//Quotas controllers

exports.statesAgreementQuotasGET = states.quotas.quotasGET;

exports.statesAgreementQuotasQuotaGET = states.quotas.quotasQuotaGET;

//Rates controllers

exports.statesAgreementRatesGET = states.rates.ratesGET;

exports.statesAgreementRatesRateGET = states.rates.ratesRateGET;
