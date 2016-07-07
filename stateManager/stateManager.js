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
        var StateModel = config.db.models.StateModel;
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
                logger.sm("Searching state for agreementID = " + _agreement.id);
                StateModel.findOne({
                    agreementId: _agreement.id
                }, (err, _state) => {
                    if (err) return reject(new errorModel(500, err));
                    else {
                        logger.sm("stateManager for agreementID = " + _agreement.id + " initialized");
                        var stateManager = {
                            agreement: ag,
                            state: _state,
                            get: _get,
                            put: _put,
                            update: _update,
                            current: _current
                        };
                        return resolve(stateManager);
                    }
                });
            }
        });
    });
}

function _get(stateType, query) {
    var stateManager = this;
    logger.sm('(_get) Retrieving state of ' + stateType);
    return new Promise((resolve, reject) => {
        logger.sm("Getting " + stateType + " state for query =  " + JSON.stringify(query));
        isUpdated(stateManager.state, stateManager.agreement, stateType, query).then((data) => {
            logger.sm("Updated: " + (data.isUpdated ? 'YES' : 'NO'));
            if (data.isUpdated) {
                logger.sm("Returning state of " + stateType);
                return resolve(stateManager.state[stateType].filter((element, index, array) => {
                    return checkQuery(element, query);
                }));
            } else {
                logger.sm("Refreshing states of " + stateType);
                stateManager.update(stateType, query, data.logsState).then((states) => {
                    return resolve(states);
                }, (err) => {
                    return reject(err);
                });
            }
        }, (err) => {
            logger.sm(JSON.stringify(err));
            return reject(new errorModel(500, "Error while checking if it is update: " + err));
        });
    });
}

/** metadata = {logsState, evidences, parameters} **/
function _put(stateType, query, value, metadata) {
    var stateManager = this;
    logger.sm('(_put) Saving state of ' + stateType);
    return new Promise((resolve, reject) => {
        var StateModel = config.db.models.StateModel;
        var elementStates = stateManager.state[stateType].filter((element, index, array) => {
            return checkQuery(element, query);
        });

        if (elementStates.length > 0 && elementStates.length <= 1) {
            /** metadata = {logsState, evidences, parameters} **/
            elementStates[0].records.push(new record(value, metadata));
            logger.sm("Updating " + stateType + " state...");
            StateModel.update({
                "agreementId": stateManager.agreement.id
            }, stateManager.state, (err) => {
                if (err) return reject(new errorModel(500, err));
                else {
                    logger.sm("==>" + stateType + " updated with query = " + JSON.stringify(query));
                    logger.sm(stateType + " state has been updated");
                    //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
                    return resolve(stateManager.state[stateType].filter((element, index, array) => {
                        return checkQuery(element, query);
                    }));
                }
            });
        } else if (elementStates.length > 1) {

            logger.sm("Error, Is not possible to updating state with this query = " + JSON.stringify(query));
            return reject(new errorModel(400, "Is not possible to updating state with this query"));

        } else {

            /** metadata = {logsState, evidences, parameters} **/
            var newState = new state(value, query, metadata);
            stateManager.state[stateType].push(newState);
            logger.sm("Updating " + stateType + " state...");
            StateModel.update({
                "agreementId": stateManager.agreement.id
            }, stateManager.state, (err, state) => {
                if (err) return reject(new errorModel(500, err));
                else {
                    //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
                    return resolve(stateManager.state[stateType].filter((element, index, array) => {
                        return checkQuery(element, query);
                    }));
                }
            });
        }
    });
}

function _update(stateType, query, logsState) {
    var stateManager = this;
    logger.sm('(_update) Updating state of ' + stateType);
    return new Promise((resolve, reject) => {
        switch (stateType) {
            case "agreement":
                calculators.agreementCalculator.process(stateManager.agreement)
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


function isUpdated(state, agreement, stateType, query) {
    return new Promise((resolve, reject) => {
        logger.sm('Checking if ' + stateType + ' is updated...');
        var logUris = null;
        for (var log in agreement.context.definitions.logs) {
            if (agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].stateUri;
        }
        var elementStates = state[stateType].filter((element, index, array) => {
            return checkQuery(element, query);
        });
        var current = null
        if (elementStates && elementStates.length > 0)
            current = getCurrent(elementStates[0]);

        logger.sm('Sending request to LOG state URI...');
        request.get({
            uri: logUris,
            json: true
        }, (err, response, body) => {
            if (err) {
                logger.error(err);
                return reject("Error with Logs state URI this: " + err);
            }
            if (response.statusCode == 200 && body) {
                if (current) {
                    if (current.logsState) {
                        if (current.logsState == body) {
                            return resolve({
                                isUpdated: true,
                                logsState: body
                            });
                        } else {
                            return resolve({
                                isUpdated: false,
                                logsState: body
                            });
                        }
                    } else {
                        return resolve({
                            isUpdated: true,
                            logsState: body
                        });
                    }
                } else {
                    return resolve({
                        isUpdated: false,
                        logsState: body
                    });
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