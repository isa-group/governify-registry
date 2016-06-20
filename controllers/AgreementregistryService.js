'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../config');

exports.namespacesGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   **/

  var NamespaceModel = config.db.models.namespace;

  NamespaceModel.find(function(err, namespaces) {
    if (err) {
      console.error(err);
      res.end();
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(namespaces));
  });
}

exports.namespacesPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (Namespace)
   **/
  // no response value expected for this operation

  var NamespaceModel = config.db.models.namespace;
  var namespace = new NamespaceModel(args.namespace.value);
  namespace.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Namespace ' + args.namespace.value.name + ' created successfully!');
    }
    res.end();
  });

  res.end();
}

exports.namespacesNamespaceAgreementsAgreementContextDefinitionsGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextDefinitionsLogsGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextDefinitionsSchemasGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextDefinitionsScopesGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextInfrastructureGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementContextValidityGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "terms": {
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
    },
    "context": {
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
    },
    "id": "aeiou",
    "type": "aeiou",
    "version": "aeiou"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.namespacesNamespaceAgreementsAgreementTermsGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsGuaranteesGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsGuaranteesGuaranteeGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * guarantee (String)
   **/
  var examples = {};
  examples['application/json'] = {
    "scope": [{}],
    "of": {},
    "id": "aeiou"
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.namespacesNamespaceAgreementsAgreementTermsMetricsGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsMetricsMetricGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingBillingGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingBillingPenaltiesGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingBillingPenaltiesPenaltyGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingBillingRewardsGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingBillingRewardsRewardGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsPricingGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsQuotasGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsAgreementTermsRatesGET = function(args, res, next) {
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

exports.namespacesNamespaceAgreementsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   **/

  var NamespaceModel = config.db.models.namespace;
  NamespaceModel.find({
    'name': args.namespace.value
  }, function(err, namespaces) {
    if (err) {
      console.log(err);
      res.end();
    }
    if (namespaces.length > 0) {
      var namespace = namespaces[0];
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(namespace.agreements));
    } else {
      console.log('No results found');
      res.end();
    }

  });

}

exports.namespacesNamespaceAgreementsPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (Agreement)
   **/
  // no response value expected for this operation

  var NamespaceModel = config.db.models.namespace;
  NamespaceModel.find({
    'name': args.namespace.value
  }, function(err, namespaces) {
    if (namespaces.length > 0) {
      try {
        var namespace = namespaces[0];
        var AgreementModel = config.db.models.agreement;
        $RefParser.dereference(args.agreement.value, function(err, schema) {
          if (err) {
            console.log(err);
            res.end(JSON.stringify({
              code: 500,
              message: err
            }));
          } else {
            var agreement = new AgreementModel(schema);
            namespace.agreements.push(agreement);
            namespace.save(function(err) {
              if (err) {
                console.log(err);
                res.end(JSON.stringify({
                  code: 500,
                  message: err
                }));
              } else {
                console.log('New agreement saved successfully!');
                res.end(JSON.stringify({
                  code: 200,
                  message: 'New agreement saved successfully!'
                }));
              }
            });
          }
        });
      } catch (error) {
        res.end(JSON.stringify({
          code: 500,
          message: error
        }));
      }
    } else {
      console.log('Namespace not found');
      res.end(JSON.stringify({
        code: 404,
        message: 'Namespace not found'
      }));
    }
  });
}

exports.namespacesNamespaceGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   **/

  var NamespaceModel = config.db.models.namespace;
  NamespaceModel.find({
    'name': args.namespace.value
  }, function(err, namespace) {
    if (err) {
      console.error(err);
      res.end();
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(namespace));
  });
}