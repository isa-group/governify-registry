'use strict';

var config = require('../config');
var logger = config.logger;
var request = require('request');
var errorModel = require('../errors/index.js').errorModel;
var iso8601 = require('iso8601');
var calculators = require('../stateManager/calculators.js');
var Promise = require("bluebird");

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
                logger.sm("Searching state for agreementID = " + _agreement.id);
                StateModel.findOne({
                    agreementId: _agreement.id
                }, (err, _state) => {
                    if (err) return reject(new errorModel(500, err));
                    else {
                        logger.sm("stateManager for agreementID = " + _agreement.id + " initialized");
                        return resolve({
                            agreement: ag,
                            state: _state,
                            get: _get,
                            put: _put,
                            update: _update,
                            current: _current
                        });
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
            StateModel.update({
                "agreementId": stateManager.agreement.id
            }, stateManager.state, (err) => {
                if (err) return reject(new errorModel(500, err));
                else {
                    logger.sm("==>" + stateType + " updated with query = " + JSON.stringify(query));
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

            StateModel.update({
                "agreementId": stateManager.agreement.id
            }, stateManager.state, (err, state) => {
                if (err) return reject(new errorModel(500, err));
                else {

                    logger.sm("==>Created new entry with query = " + JSON.stringify(query));

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
                    .then(function(guarantees) {
                        logger.sm('All guarantees (' + guarantees.length + ') has been calculated ');
                        var processguarantees = [];
                        for (var g in guarantees) {
                            processguarantees.push(stateManager.put(stateType, {
                                guarantee: query.guarantee,
                                period: guarantees[g].period,
                                scope: guarantees[g].scope
                            }, guarantees[g].value, {
                                "logsState": logsState,
                                metrics: guarantees[g].metrics,
                                penalties: guarantees[g].penalties ? guarantees[g].penalties : null
                            }));
                        }
                        logger.sm('Created parameters array for saving state of guarantees of length ' + processguarantees.length);
                        logger.sm('Persisting guarantees...');
                        Promise.all(processguarantees).then((guarantees) => {
                            logger.sm('All guarantees has been persisted');
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
                    .then(function(metricState) {
                        var processMetrics = [];
                        for (var m in metricState.metricValues) {
                            processMetrics.push(
                                stateManager.put(stateType, {
                                    metric: query.metric,
                                    scope: metricState.metricValues[m].scope,
                                    period: metricState.metricValues[m].period,
                                    window: query.window
                                }, metricState.metricValues[m].value, {
                                    "logsState": logsState,
                                    evidences: metricState.metricValues[m].evidences,
                                    parameters: metricState.metricValues[m].parameters
                                }));
                        }
                        Promise.all(processMetrics).then((metrics) => {
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
                calculators.pricingCalculator.process(stateManager.agreement, query, stateManager).then((pricingStates) =>{
                    logger.sm('All pricing states (' + pricingStates.length + ') has been calculated ');
                    return resolve(pricingStates);
                }, (err) =>{
                    logger.error(err.toString());
                    return reject(new errorModel(500, err));
                });
                break;
            default:
                return reject(new errorModel(500, "There are not method implemented to calculate " + stateType +  " state"));
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
        var logUris = null;
        for (var log in agreement.context.definitions.logs) {
            if (agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].stateUri;
        }
        var elementStates = state[stateType].filter((element, index, array) => {
            return checkQuery(element, query);
        });
        var current = null
        if (elementStates.length > 0)
            current = getCurrent(elementStates[0]);
        request.get({
            uri: logUris,
            json: true
        }, (err, response, body) => {
            if (!err && response.statusCode == 200 && body) {
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
    var currentRecord = getCurrent(state);
    for (var v in currentRecord) {
        if (v != 'time' && v != 'logsState')
            state[v] = currentRecord[v];
    }
    delete state.records;
    return state;
}
