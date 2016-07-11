'use strict';

var config = require('../config');
var logger = config.logger;
var request = require('request');
var errorModel = require('../errors/index.js').errorModel;
var iso8601 = require('iso8601');
var calculators = require('../stateManager/calculators.js');
var Promise = require("bluebird");
var clone = require('clone');

module.exports = initialize;

function initialize(_agreement) {
    logger.sm('(initialize) Initializing state with agreement ID = ' + _agreement.id);
    return new Promise((resolve, reject) => {
        var AgreementModel = config.db.models.AgreementModel;
        logger.sm("Searching agreement with agreementID = " + _agreement.id);
        AgreementModel.findOne({
            'id': _agreement.id
        }, function(err, ag) {
            if (err) {
                logger.error(err.toString());
                return reject(new errorModel(500, err));
            } else {
                if (!ag) {
                    return reject(new errorModel(404, 'There is no agreement with id: ' + _agreement.id));
                }
                logger.sm("StateManager for agreementID = " + _agreement.id + " initialized");
                var stateManager = {
                    agreement: ag,
                    get: _get,
                    put: _put,
                    update: _update,
                    current: _current
                };
                return resolve(stateManager);
            }
        });
    });
}

function _get(stateType, query) {
    var stateManager = this;
    logger.sm('(_get) Retrieving state of ' + stateType);
    return new Promise((resolve, reject) => {
        logger.sm("Getting " + stateType + " state for query =  " + JSON.stringify(query));
        var StateModel = config.db.models.StateModel;
        StateModel.aggregate([
          {$match: {agreementId: stateManager.agreement.id}},
          {$project: projectionBuilder(stateType, refineQuery(stateType, query))}
        ], (err, result) => {
            if(err){
                logger.sm(JSON.stringify(err));
                return reject(new errorModel(500, "Error while retrieving %s states: %s", stateType, err.toString()));
            }
            if(result[0][stateType].length > 0){
                logger.sm("There are " + stateType + " state for query =  " + JSON.stringify(query) + " in DB");
                var states = result[0][stateType];

                logger.sm('Checking if ' + stateType + ' is updated...');
                isUpdated(stateManager.agreement, states).then((data)=>{
                    logger.sm("Updated: " + (data.isUpdated ? 'YES' : 'NO'));
                    if (data.isUpdated) {

                        logger.sm("Returning state of " + stateType);
                        return resolve(states);

                    } else {

                        logger.sm("Refreshing states of " + stateType);
                        stateManager.update(stateType, query, data.logsState).then((states) => {
                            return resolve(states);
                        }, (err) => {
                            return reject(err);
                        });

                    }
                }, (err)=>{
                    logger.sm(JSON.stringify(err));
                    return reject(new errorModel(500, "Error while checking if it is update: " + err));
                });
            }else{
                logger.sm("There are not " + stateType + " state for query =  " + JSON.stringify(query) + " in DB");
                logger.sm("Adding states of " + stateType);
                isUpdated(stateManager.agreement, states).then((data)=>{
                    stateManager.update(stateType, query, data.logsState).then((states) => {
                        return resolve(states);
                    }, (err) => {
                        return reject(err);
                    });
                }, (err)=>{
                    logger.sm(JSON.stringify(err));
                    return reject(new errorModel(500, "Error while checking if it is update: " + err));
                });
            }
        });

    });
}

/** metadata = {logsState, evidences, parameters} **/
function _put(stateType, query, value, metadata) {
    var stateManager = this;
    logger.sm('(_put) Saving state of ' + stateType);
    return new Promise((resolve, reject) => {
          var StateModel = config.db.models.StateModel;

          var dbQuery = {
            agreementId: stateManager.agreement.id
          };
          dbQuery[stateType] = { $elemMatch: refineQuery(stateType, query) };
          logger.sm("Updating " + stateType + " state...");

          var push = {};
          push[stateType + ".0.records"] = new record(value, metadata);

          StateModel.update(dbQuery, {$push: push},(err, result)=>{
            if(err){
                logger.sm("Error, Is not possible to updating state with this query = " + JSON.stringify(query));
                return reject(new errorModel(500, err));
            } else {
                logger.sm("NMODIFIED record:  " + JSON.stringify(result) );


                var idS = null;
                if( query.guarantee){
                  idS = "G_"+query.guarantee;
                }
                if( query.metric){
                  idS = "M_"+query.metric;
                }

                logger.sm("StateSignature: (%d) [%s_%s_%s_%s_%s]",result.nModified,idS,query.scope.node, query.scope.priority, query.period.to, query.period.from );

              // Check if there already is an stete
              if(result.nModified === 0){
                  // There is no state for Guarantee / Metric , ....
                  logger.sm("Creating new " + stateType + " state with the record...");

                  var newState = new state(value, query, metadata);
                  var updateQuery = {
                     parm01: { agreementId: stateManager.agreement.id },
                     parm02: {$push:{}}
                  }
                  updateQuery.parm02.$push[stateType] = newState;
                  logger.sm("updateQuery = " + JSON.stringify(updateQuery, null, 2));
                  StateModel.update(updateQuery.parm01, updateQuery.parm02 ,(err, result)=>{
                    if(err){
                      logger.error(err.toString());
                      return  reject(new errorModel(500, err));
                    }
                    else {
                      logger.sm("Inserted new record in the new " + stateType + " state.");
                      StateModel.aggregate([
                        {$match: {agreementId: stateManager.agreement.id}},
                        {$project: projectionBuilder(stateType, refineQuery(stateType, query))}
                      ], (err, result) => {
                          if(err){
                            logger.error(err.toString());
                            return  reject(new errorModel(500, err));
                          }
                          if(result.length != 1){
                              logger.error("Inconsistent DB: multiple agreement states " + JSON.stringify(  {agreementId: stateManager.agreement.id} , null, 2));
                              return reject(new errorModel(500, "Inconsistent DB: multiple agreement states " + JSON.stringify(  {agreementId: stateManager.agreement.id} , null, 2)));
                          }else{
                              if(result[0][stateType].length != 1){
                                  logger.error("Inconsistent DB: multiple " + stateType + " states for query: " + JSON.stringify( refineQuery(stateType, query), null, 2));
                                  logger.error("   DB result: " + JSON.stringify( result[0][stateType], null, 2));
                                  return reject(new errorModel(500, "Inconsistent DB: multiple " + stateType + " states for query: " + JSON.stringify( refineQuery(stateType, query), null, 2)));
                              }else{
                                  return resolve(result[0][stateType]);
                              }
                          }
                      });
                    }
                  });
              }else{
                  // There is some state for Guarantee / Metric , ....
                  // Lets add a new record.
                  logger.sm("Inserted new record of " + stateType + " state.");
                  StateModel.aggregate([
                    {$match: {agreementId: stateManager.agreement.id}},
                    {$project: projectionBuilder(stateType, refineQuery(stateType, query))}
                  ], (err, result) => {

                      if(err){
                        logger.error(err.toString());
                        return  reject(new errorModel(500, err));
                      }
                      if(result.length != 1){
                          logger.error("Inconsistent DB: multiple agreement states " + JSON.stringify(  {agreementId: stateManager.agreement.id} , null, 2));
                          return reject(new errorModel(500, "Inconsistent DB: multiple agreement states " + JSON.stringify(  {agreementId: stateManager.agreement.id} , null, 2)));
                      }else{
                          if(result[0][stateType].length != 1){
                              logger.error("Inconsistent DB: multiple " + stateType + " states for query: " + JSON.stringify( refineQuery(stateType, query), null, 2));
                              return reject(new errorModel(500, "Inconsistent DB: multiple " + stateType + " states for query: " + JSON.stringify( refineQuery(stateType, query), null, 2)));
                          }else{
                              return resolve(result[0][stateType]);
                          }
                      }
                  });
              }

            }
          })
    });
}

function _update(stateType, query, logsState) {
    var stateManager = this;
    logger.sm('(_update) Updating state of ' + stateType);
    return new Promise((resolve, reject) => {
        switch (stateType) {
            case "agreement":
                calculators.agreementCalculator.process(stateManager.agreement, stateManager)
                    .then(function(agreementState) {
                        stateManager.put(stateType, agreementState).then((data) => {
                            return resolve(data);
                        }, (err) => {
                            return reject(err);
                        });
                    }, function(err) {
                        logger.error(err.toString());
                        return reject(new errorModel(500, err));
                    });
                break;
            case "guarantees":
                calculators.guaranteeCalculator.process(stateManager.agreement, query.guarantee, stateManager)
                    .then(function(guaranteeStates) {
                        logger.sm('Guarantee states for ' + guaranteeStates.guaranteeId + ' has been calculated (' + guaranteeStates.guaranteeValues.length + ') ');
                        logger.debug('Guarantee states: ' + JSON.stringify(guaranteeStates, null, 2));
                        var processguarantees = [];
                        guaranteeStates.guaranteeValues.forEach(function(guaranteeState) {
                            logger.debug('Guarantee state: ' + JSON.stringify(guaranteeState, null, 2));
                            processguarantees.push(stateManager.put(stateType, {
                                guarantee: query.guarantee,
                                period: guaranteeState.period,
                                scope: guaranteeState.scope
                            }, guaranteeState.value, {
                                "logsState": logsState,
                                metrics: guaranteeState.metrics,
                                evidences: guaranteeState.evidences,
                                penalties: guaranteeState.penalties ? guaranteeState.penalties : null
                            }));
                        });
                        logger.sm('Created parameters array for saving states of guarantee of length ' + processguarantees.length);
                        logger.sm('Persisting guarantee states...');
                        Promise.all(processguarantees).then((guarantees) => {
                            logger.sm('All guarantee states has been persisted');
                            var result = [];
                            for (var a in guarantees) {
                                result.push(guarantees[a][0]);
                            }
                            return resolve(result);
                        });
                    }, function(err) {
                        logger.error(err.toString());
                        return reject(new errorModel(500, err));
                    });
                break;
            case "metrics":
                calculators.metricCalculator.process(stateManager.agreement, query.metric, query)
                    .then(function(metricStates) {
                        logger.sm('Metric states for ' + metricStates.metricId + ' has been calculated (' + metricStates.metricValues.length + ') ');
                        var processMetrics = [];
                        metricStates.metricValues.forEach(function(metricValue) {
                            processMetrics.push(
                                stateManager.put(stateType, {
                                    metric: query.metric,
                                    scope: metricValue.scope,
                                    period: metricValue.period,
                                    window: query.window
                                }, metricValue.value, {
                                    "logsState": logsState,
                                    evidences: metricValue.evidences,
                                    parameters: metricValue.parameters
                                }));
                        });
                        logger.sm('Created parameters array for saving states of metric of length ' + processMetrics.length);
                        logger.sm('Persisting metric states...');
                        Promise.all(processMetrics).then((metrics) => {
                            logger.sm('All metric states has been persisted');
                            var result = [];
                            for (var a in metrics) {
                                result.push(metrics[a][0]);
                            }
                            return resolve(result);
                        })
                    }, function(err) {
                        logger.error(err.toString());
                        return reject(new errorModel(500, err));
                    });
                break;
            case "pricing":
                calculators.pricingCalculator.process(stateManager.agreement, query, stateManager).then((pricingStates) => {
                    logger.sm('All pricing states (' + pricingStates.length + ') has been calculated ');
                    return resolve(pricingStates);
                }, (err) => {
                    logger.error(err.toString());
                    return reject(new errorModel(500, err));
                });
                break;
            default:
                return reject(new errorModel(500, "There are not method implemented to calculate " + stateType + " state"));
                break;

        }
    });

}

/** metadata = {logsState, evidences, parameters} **/
function state(value, query, metadata) {
    for (var v in query) {
        this[v] = query[v];
    }
    this.records = [];
    this.records.push(new record(value, metadata));
}

/** metadata = {logsState, evidences, parameters} **/
function record(value, metadata) {

    this.value = value;
    this.time = iso8601.fromDate(new Date());
    if (metadata) {
        for (var v in metadata) {
            this[v] = metadata[v];
        }
    }

}


function isUpdated(agreement, states) {
    return new Promise((resolve, reject) => {
        var logUris = null;
        for (var log in agreement.context.definitions.logs) {
            if (agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].stateUri;
        }

        var current = states;
        if (current)
            current = getCurrent(current[0]);

        logger.sm('Sending request to LOG state URI...');
        request.get({ uri: logUris, json: true}, (err, response, body) => {
            if (err) {
                logger.error(err);
                return reject("Error with Logs state URI this: " + err);
            }
            if (response.statusCode == 200 && body) {
                if (current) {
                    if (current.logsState) {
                        if (current.logsState == body) {
                            return resolve({isUpdated: true,  logsState: body});
                        } else {
                            return resolve({  isUpdated: false,logsState: body  });
                        }
                    } else {
                        return resolve({isUpdated: true,  logsState: body});
                    }
                } else {
                    return resolve({isUpdated: false, logsState: body});
                }
            } else {
                return reject("Error with Logs state URI this: " + logUris + " is not correct");
            }
        });
      });
}

function checkQuery(element, query) {
    var ret = true;
    for (var v in query) {
        if (v != "parameters" && v != "evidences" && v != "logs") {
            if (query[v] instanceof Object) {
                ret = ret && checkQuery(element[v], query[v]);
            } else {
                if (element[v] !== query[v] && query[v] != "*") {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}

function getCurrent(state) {
    return state.records[state.records.length - 1];
}

function _current(state) {
    var newState = clone(state);
    var currentRecord = getCurrent(newState);
    for (var v in currentRecord) {
        if (v != 'time' && v != 'logsState')
            newState[v] = currentRecord[v];
    }
    delete newState.records;
    return newState;
}

// refines the query for a search in db
function refineQuery(stateType, query){
    var refinedQuery = {};
    if(query.scope)
      refinedQuery.scope = query.scope;
    if(query.period)
      refinedQuery.period = query.period;

    switch (stateType) {
      case 'metrics':
        refinedQuery.metric = query.metric;
        if(query.window)
          refinedQuery.window= query.window;
        break;
      case 'guarantees':
        refinedQuery.guarantee = query.guarantee;
        break;
    }

    return refinedQuery;
}

function projectionBuilder (stateType, query){
    var singular = {guarantees: "guarantee", metrics: "metric", quotas: "quota", rates: "rate", pricing: "pricing"};
    var conditionArray = [];
    var projection = {};
    var singularStateType = singular[stateType];
    if(!singularStateType) return logger.error("projectionBuilder error: stateType '%s' is not expected", stateType);

    //iterate over element in the query (scope, period...)
    for(var v in query){
      if(query[v] instanceof Object){
        var queryComponent = query[v];
        //if it is an object we iterate over it (e.g. period.*)
        for(var qC in queryComponent){
          var propValue = null;
          var propName = "$$" + singularStateType;
          propName += "." + v + "." + qC;
          propValue = queryComponent[qC];
          var eq = {$eq: [propName, propValue]}
          if(propValue != '*')
            conditionArray.push(eq);
        }
      }else{
        //if it is not an object we add it directly (e.g. guarantee.guarantee = "K01")
        var propValue = null;
        var propName = "$$" + singularStateType;
        propName += "." + v;
        propValue = query[v];
        var eq = {$eq: [propName, propValue]}
        conditionArray.push(eq);
      }
    }

    projection[stateType] = {
      $filter: {
        input: '$'+stateType,
        as: singularStateType,
        cond: {
          $and: conditionArray
        }
      }
    }
    logger.sm("Mongo projection: " + JSON.stringify(projection, null, 2));
    return projection;
}
