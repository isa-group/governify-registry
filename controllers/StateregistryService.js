'use strict';

var calculators = require('../calculators/calculators.js');
var request = require('request');
var config = require('../config');
var example = require('../data');

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
   * from (String)
   * to (String)
   **/
  res.setHeader('Content-Type', 'application/json');

  var agreementId = args.agreement.value;
  var from = '';
  var to = '';
  if (args.from) {
    from = args.from.value;
  }
  if (args.to) {
    to = args.to.value;
  }

  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': agreementId
  }, function(err, agreement) {
    if (err) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: err
      }));
    }

    if (agreement.length === 1) {
      calculators.agreementCalculator.process(agreement[0], from, to).then(function(compensations) {
        res.end(JSON.stringify(compensations));
      }, function(err) {
        console.log(err);
        res.status(500).end(JSON.stringify({
          code: 500,
          message: err
        }));
      });
    } else if (agreement.length === 0) {
      res.status(404).end(JSON.stringify({
        code: 404,
        message: 'Agreement ' + agreementId + ' cannot be found.'
      }));
    } else if (agreement.length > 1) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: 'Error while retrieving agreement ' + agreementId + ' from database.'
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

  res.setHeader('Content-Type', 'application/json');

  var agreementId = args.agreement.value;
  var from = '';
  var to = '';
  if (args.from) {
    from = args.from.value;
  }
  if (args.to) {
    to = args.to.value;
  }

  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': agreementId
  }, function(err, agreement) {
    if (err) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: err
      }));
    }

    if (agreement.length === 1) {
      calculators.guaranteeCalculator.processAll(agreement[0], from, to).then(function(compensations) {
        res.end(JSON.stringify(compensations));
      }, function(err) {
        console.log(err);
        res.status(500).end(JSON.stringify({
          code: 500,
          message: err
        }));
      });
    } else if (agreement.length === 0) {
      res.status(404).end(JSON.stringify({
        code: 404,
        message: 'Agreement ' + agreementId + ' cannot be found.'
      }));
    } else if (agreement.length > 1) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: 'Error while retrieving agreement ' + agreementId + ' from database.'
      }));
    }
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

  var agreementId = args.agreement.value;
  var guaranteeId = args.guarantee.value;
  var from = '';
  var to = '';
  if (args.from) {
    from = args.from.value;
  }
  if (args.to) {
    to = args.to.value;
  }

  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': agreementId
  }, function(err, agreement) {
    if (err) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: err
      }));
    }

    if (agreement.length === 1) {
      calculators.guaranteeCalculator.process(agreement[0], guaranteeId, from, to).then(function(guaranteeState) {
        res.end(JSON.stringify(guaranteeState));
      }, function(err) {
        console.log(err);
        res.status(500).end(JSON.stringify({
          code: 500,
          message: err
        }));
      });
    } else if (agreement.length === 0) {
      res.status(404).end(JSON.stringify({
        code: 404,
        message: 'Agreement ' + agreementId + ' cannot be found.'
      }));
    } else if (agreement.length > 1) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: 'Error while retrieving agreement ' + agreementId + ' from database.'
      }));
    }

    res.end(JSON.stringify(agreement.terms.guarantees));
  });
}

exports.statesAgreementMetricsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
  res.setHeader('Content-Type', 'application/json');

  var agreementId = args.agreement.value;
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': agreementId
  }, function(err, agreement) {
    if (err) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: err
      }));
    }
    if (agreement.length === 1) {
      var processMetrics = [];
      var metricParams = {
        "scope": {
          "priority": "3",
          "node": "*",
          "serviceLine": "1. Linea servicio de mantenimiento básico",
          "activity": "1.1. Actividad de incidencias"
        },
        "window": {
          "type": "static",
          "period": "monthly",
          "initial": "20160116",
          "end": ""
        }
      }
      for (var metricId in agreement[0].terms.metrics) {
        processMetrics.push(calculators.metricCalculator.process(agreement[0], metricId, metricParams));
      }

      Promise.all(processMetrics).then(function(metricsValues) {
        res.end(JSON.stringify(metricValues));
      });
    } else if (agreement.length === 0) {
      res.status(404).end(JSON.stringify({
        code: 404,
        message: 'Agreement ' + agreementId + ' cannot be found.'
      }));
    } else if (agreement.length > 1) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: 'Error while retrieving agreement ' + agreementId + ' from database.'
      }));
    }
  });

}

exports.statesAgreementMetricsMetricGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * metric (String)
   **/

  res.setHeader('Content-Type', 'application/json');

  var agreementId = args.agreement.value;
  var metricId = args.metric.value;
  var from = '';
  var to = '';
  if (args.from) {
    from = args.from.value;
  }
  if (args.to) {
    to = args.to.value;
  }

  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': agreementId
  }, function(err, agreement) {
    if (err) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: err
      }));
    }

    var metricParams = {
      "scope": {
        "priority": "3",
        "node": "*",
        "serviceLine": "1. Linea servicio de mantenimiento básico",
        "activity": "1.1. Actividad de incidencias"
      },
      "window": {
        "type": "static",
        "period": "monthly",
        "initial": "20160116",
        "end": ""
      }
    }

    if (agreement.length === 1) {
      calculators.metricCalculator.process(agreement[0], metricId, metricParams).then(function(metricState) {
        if (metricState.metricValues) {
          res.end(JSON.stringify(metricState.metricValues));
        }
      }, function(err) {
        console.log(err);
        res.status(500).end(JSON.stringify({
          code: 500,
          message: err
        }));
      });
    } else if (agreement.length === 0) {
      res.status(404).end(JSON.stringify({
        code: 404,
        message: 'Agreement ' + agreementId + ' cannot be found.'
      }));
    } else if (agreement.length > 1) {
      res.status(500).end(JSON.stringify({
        code: 500,
        message: 'Error while retrieving agreement ' + agreementId + ' from database.'
      }));
    }
  });

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

exports.statesAgreementQuotasGET = function(args, res, next) {
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

exports.statesAgreementQuotasQuotaGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * quota (String)
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

exports.statesAgreementQuotasQuotaPUT = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * quota (String)
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

exports.statesAgreementRatesGET = function(args, res, next) {
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

exports.statesAgreementRatesRateGET = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * rate (String)
   **/
  var examples = {};
  examples['application/json'] = [{
    name: "sas"
  }, {
    name: "oai"
  }];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}

exports.statesAgreementRatesRatePUT = function(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   * agreement (String)
   * rate (String)
   **/
  var examples = {};
  examples['application/json'] = [{
    name: "sas"
  }, {
    name: "oai"
  }];
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }

}