'use strict';

var mongoose = require('mongoose');
var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../config');
var fs = require('fs');
var errorModel = require('../errors/index.js').errorModel;
var logger = config.state.logger;

var agreements = require('./agreements/agreements.js');

exports.agreementsGET = agreements.agreementsGET;

exports.agreementsPOST = agreements.agreementsPOST;

exports.agreementsAgreementGET = agreements.agreementIdGET;


exports.agreementsAgreementTermsGuaranteesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': args.agreement.value
  }, function(err, agreement) {
    if (err) {
      console.error(err);
      res.end();
    }
    if (agreement.length === 1) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(agreement[0].terms.guarantees));
    }
  });

}

exports.agreementsAgreementTermsGuaranteesGuaranteeGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * guarantee (String)
   **/
  var guarantee = {};
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': args.agreement.value
  }, function(err, agreement) {
    if (err) {
      console.error(err);
      res.end();
    }
    if (agreement.length === 1) {
      var guarantee = agreement[0].terms.guarantees.filter(function(guarantee) {
        return guarantee.id === args.guarantee.value;
      });

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(guarantee));
    }
  });

}

exports.agreementsAgreementContextDefinitionsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "provider": "aeiou",
    "infrastructure": {},
    "validity": {
      "init": "aeiou",
      "end": "aeiou"
    },
    "definitions": {
      "schemas": {},
      "scopes": {},
      "logs": {}
    },
    "consumer": "aeiou"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementContextDefinitionsLogsGET = function(args, res, next) {
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

exports.agreementsAgreementContextDefinitionsSchemasGET = function(args, res, next) {
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

exports.agreementsAgreementContextDefinitionsScopesGET = function(args, res, next) {
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

exports.agreementsAgreementContextGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "provider": "aeiou",
    "infrastructure": {},
    "validity": {
      "init": "aeiou",
      "end": "aeiou"
    },
    "definitions": {
      "schemas": {},
      "scopes": {},
      "logs": {}
    },
    "consumer": "aeiou"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementContextInfrastructureGET = function(args, res, next) {
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

exports.agreementsAgreementContextValidityGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "init": "aeiou",
    "end": "aeiou"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "quotas": {},
    "rates": {},
    "metrics": {},
    "guarantees": {},
    "pricing": {
      "cost": 1.3579000000000001069366817318950779736042022705078125,
      "currency": "aeiou",
      "billing": {
        "init": "aeiou",
        "period": "aeiou",
        "penalties": "",
        "rewards": ""
      }
    }
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsMetricsGET = function(args, res, next) {
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

exports.agreementsAgreementTermsMetricsMetricGET = function(args, res, next) {
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

exports.agreementsAgreementTermsPricingBillingGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "init": "aeiou",
    "period": "aeiou",
    "penalties": "",
    "rewards": ""
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsPricingBillingPenaltiesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = "";
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * penalty (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "over": {},
    "upTo": 1.3579000000000001069366817318950779736042022705078125,
    "aggegatedBy": "aeiou",
    "of": "",
    "id": "aeiou",
    "groupBy": [{}]
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsPricingBillingRewardsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = "";
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsPricingBillingRewardsRewardGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * reward (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "over": {},
    "upTo": 1.3579000000000001069366817318950779736042022705078125,
    "aggegatedBy": "aeiou",
    "of": "",
    "id": "aeiou",
    "groupBy": [{}]
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsPricingGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "cost": 1.3579000000000001069366817318950779736042022705078125,
    "currency": "aeiou",
    "billing": {
      "init": "aeiou",
      "period": "aeiou",
      "penalties": "",
      "rewards": ""
    }
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.agreementsAgreementTermsQuotasGET = function(args, res, next) {
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

exports.agreementsAgreementTermsRatesGET = function(args, res, next) {
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
