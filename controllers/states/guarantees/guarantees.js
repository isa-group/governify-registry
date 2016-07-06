'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");
var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.logger;
var Promise = require("bluebird");

module.exports.guaranteesGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then((manager) => {
        logger.ctlState("Getting state of guarantees...");

        if (config.async.guarantees) {
            logger.ctlState("Processing guarantees in async mode");
            var processGuarantees = [];
            manager.agreement.terms.guarantees.forEach(function(guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

            Promise.settle(processGuarantees).then(function(guaranteesValues) {
                try {
                    if (guaranteesValues.length > 0) {
                        var result = [];
                        for (var i = 0; i < guaranteesValues.length; i++) {
                            if (guaranteesValues[i].isFulfilled()) {
                                if (guaranteesValues[i].value().length > 0) {
                                    var guaranteesResults = guaranteesValues[i].value().map(function(guaranteeValue) {
                                        return manager.current(guaranteeValue);
                                    });
                                    result = result.concat(guaranteesResults);
                                }
                            }
                        }
                        res.json(result);
                    } else {
                        var err = 'Error processing guarantee: empty result';
                        logger.error(err);
                        res.status(500).json(new errorModel(500, err));
                    }
                } catch (err) {
                    logger.error(err);
                    res.status(500).json(new errorModel(500, err));
                }
            }, function(err) {
                logger.error(err);
                res.status(500).json(new errorModel(500, err));
            });
        } else {
            logger.ctlState("Processing guarantees in sync mode");
            var ret = [];
            Promise.each(manager.agreement.terms.guarantees, (guarantee) => {
                logger.ctlState("- guaranteeId: " + guarantee.id);
                // var guaranteeParams = args.scope.value;
                // guaranteeParams.period = guaranteeParams.period ? guaranteeParams.period : {
                //     from: '*',
                //     to: '*'
                // };
                // guaranteeParams.guarantee = guarantee.id;
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then((results) => {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, (err) => {
                    logger.error(err);
                });
            }).then(function(results) {
                res.json(ret);
            }, (err) => {
                logger.error("ERROR processing guarantees: ", err);
                res.status(500).json(new errorModel(500, err));
            });
        }
    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}

module.exports.guaranteeIdGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     **/
    logger.ctlState("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;

    stateManager({
        id: agreementId
    }).then((manager) => {
        manager.get('guarantees', {
            guarantee: guaranteeId
        }).then(function(success) {
            res.json(success.map((element) => {
                return manager.current(element);
            }));
        }, function(err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });
    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}

module.exports.guaranteeIdPenaltyPOST = function(args, res, next) {
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;
    var periods = new getPeriods(query.window, offset);

    stateManager({
        id: agreementId
    }).then((manager) => {

        var resul = [];
        Promise.each(periods, (element) => {
            var p = {
                from: moment(element.from).subtract(Math.abs(offset), "months"),
                to: moment(element.to).subtract(Math.abs(offset), "months").add(24,"hours").add(59, "minutes").add(59, "seconds").add(999, "ms")
            };
            //  logger.ctlState("Query before parse: " + JSON.stringify(query, null, 2));
              var logId = Object.keys(query.logs)[0];
              var log = manager.agreement.context.definitions.logs[logId];
              var scope = {};
              var scopeId = Object.keys(log.scopes)[0];
              var logScopes = Object.keys(log.scopes[scopeId]).map(function(key) {
                  return log.scopes[scopeId][key];
              });
              for (var queryScope in query.scope) {
                  if (logScopes.indexOf(queryScope) > -1) {
                      for (var logScope in log.scopes[scopeId]) {
                          if (log.scopes[scopeId][logScope] === queryScope) {
                              scope[logScope] = query.scope[queryScope];
                          }
                      }
                  } else {
                      scope[queryScope] = query.scope[queryScope];
                  }
              }
              query.scope = scope ? scope : query.scope;

            //  logger.ctlState("Query after parse: " + JSON.stringify(query, null, 2));
            return manager.get('guarantees', {
                  guarantee: guaranteeId,
                  scope: query.scope,
                //  period: p //,
                //  window: query.window
              }).then(function(success) {
                  var ret = [];
                  for(var i in success){
                    var e = success[i];
                    //logger.ctlState("compare:  " + e.period.from + ">=" + p.from.toISOString() + " && " + e.period.to + "<=" + p.to.toISOString() );
                    if(moment(e.period.from).isSameOrAfter(p.from) && moment(e.period.to).isSameOrBefore(p.to)  && checkQuery(e, query)){
                          ret.push( e );
                    }
                  }
                  //logger.ctlState("Resultado para el periodo : " + JSON.stringify(element) + "=>\n" + JSON.stringify(ret, null, 2));

                  for(var i in ret){
                    if(manager.current(ret[i]).penalties){
                        var penalties = manager.current(ret[i]).penalties
                        for (var penaltyI in penalties){
                            resul.push(new penaltyMetric( ret[i].scope, query.parameters, element, query.logs, penaltyI, penalties[penaltyI] ));
                        }
                    }
                  }

            }, function(err) {
                logger.error(err);
                //res.status(500).json(new errorModel(500, err));
            });

        }).then((result) => {
            res.json(resul);
        }, (err) => {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });

    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });


}

var moment = require('moment');

function getPeriods(window, offset) {
    var periods = [];
    var Wfrom = moment(window.initial);
    var Wto = moment();
    var from = moment(Wfrom),
        to = moment(Wfrom).add(1, "months").subtract(1, "days");
    while (!to || to.isSameOrBefore(Wto)) {
        periods.push({
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD")
        });
        from = moment(from).add(1, "months");
        to = moment(to).add(1, "months");
    }
    return periods;
}

//function
function penaltyMetric (scope, parameters, period, logs, penaltyName, penaltyValue){
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.penalty = penaltyName;
    this.value = penaltyValue;
    this.logs = logs;
}

function checkQuery(element, query) {
    var ret = true;
    for (var v in query) {
        if (v != "parameters" && v != "evidences" && v != "logs" && v != "window") {
            if (query[v] instanceof Object) {
                ret = ret && checkQuery(element[v], query[v]);
            } else {
                if (( element[v] !== query[v] && query[v] != "*" ) || !element[v]) {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}
