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

/**
 * Intialize the StateManager for an agreement.
 *
 * @param {String} agreement identifier
 * @return {Promise} Promise that will return a StateManager object
 * @api public
 */
function initialize(_agreement) {
    logger.sm('(initialize) Initializing state with agreement ID = ' + _agreement.id);
    return new Promise((resolve, reject) => {
        var AgreementModel = config.db.models.AgreementModel;
        logger.sm("Searching agreement with agreementID = " + _agreement.id);
        //Executes a mongodb query to search Agreement file with id = _agreement
        AgreementModel.findOne({
            'id': _agreement.id
        }, function(err, ag) {
            if (err) {
                //something fail on mongodb query and error is returned
                logger.error(err.toString());
                return reject(new errorModel(500, err));
            } else {
                if (!ag) {
                    //Not found agreement with id = _agreement
                    return reject(new errorModel(404, 'There is no agreement with id: ' + _agreement.id));
                }
                logger.sm("StateManager for agreementID = " + _agreement.id + " initialized");
                //Building stateManager object with agreement definitions and stateManager method
                //get ==> gets one or more states, put ==> save an scoped state,
                //update ==> calculates one or more states and save them,
                //current ==> do a map over state an returns the current record for this state.
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

/**
 * Gets one or more states by an specific query.
 *
 * @param {String} state type enum: {guarantees, pricing, agreement, metrics}
 * @param {StateManagerQuery} query will be matched with an state.
 * @return {Promise} Promise that will return an array of state objects
 * @api public
 */
function _get(stateType, query) {
    var stateManager = this;
    logger.sm('(_get) Retrieving state of ' + stateType);
    return new Promise((resolve, reject) => {
        logger.sm("Getting " + stateType + " state for query =  " + JSON.stringify(query));
        var StateModel = config.db.models.StateModel;
        //Executes a mongodb query to search States file that match with query
        // projectionBuilder(...) builds a mongodb query from StateManagerQuery
        // refineQuery(...) ensures that the query is well formed, chooses and renames fields to make a well formed query.
        StateModel.find(projectionBuilder(stateType, refineQuery(stateManager.agreement.id, stateType, query)), (err, result) => {
            if (err) {
                //something fail on mongodb query and error is returned
                logger.sm(JSON.stringify(err));
                return reject(new errorModel(500, "Error while retrieving %s states: %s", stateType, err.toString()));
            }
            //If there are states in mongodb match the query, checks if it's updated and returns.
            if (result.length > 0) {
                logger.sm("There are " + stateType + " state for query =  " + JSON.stringify(query) + " in DB");
                var states = result;

                logger.sm('Checking if ' + stateType + ' is updated...');
                isUpdated(stateManager.agreement, states).then((data) => {
                    logger.sm("Updated: " + (data.isUpdated ? 'YES' : 'NO'));
                    if (data.isUpdated) {
                        //States are updated, returns.
                        logger.sm("Returning state of " + stateType);
                        return resolve(states);

                    } else {
                        //States are updated, returns.
                        logger.sm("Refreshing states of " + stateType);
                        // Register agreement to progress list
                        if (config.state.statusBouncer)
                            config.state.agreementsInProgress.push(stateManager.agreement.id);
                        stateManager.update(stateType, query, data.logsState).then((states) => {
                            // Remove agreement from progress list
                            if (config.state.statusBouncer)
                                config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(stateManager.agreement.id), 1);
                            return resolve(states);
                        }, (err) => {
                            return reject(err);
                        });

                    }
                }, (err) => {
                    logger.sm(JSON.stringify(err));
                    return reject(new errorModel(500, "Error while checking if it is update: " + err));
                });
            } else {
                logger.sm("There are not " + stateType + " state for query =  " + JSON.stringify(query) + " in DB");
                logger.sm("Adding states of " + stateType);
                isUpdated(stateManager.agreement).then((data) => {
                    if (data.isUpdated) {
                        logger.sm("There is no state for this metric. Returning initial values.")
                        var newState = new state(0, query, {});
                        return resolve([newState]);
                    } else {
                        // Register agreement to progress list
                        if (config.state.statusBouncer)
                            config.state.agreementsInProgress.push(stateManager.agreement.id);
                        stateManager.update(stateType, query, data.logsState).then((states) => {
                            // Remove agreement from progress list
                            if (config.state.statusBouncer)
                                config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(stateManager.agreement.id), 1);
                            return resolve(states);
                        }, (err) => {
                            return reject(err);
                        });
                    }

                }, (err) => {
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

        logger.sm("AGREEMENT: " + stateManager.agreement.id);
        var dbQuery = projectionBuilder(stateType, refineQuery(stateManager.agreement.id, stateType, query));
        logger.sm("Updating " + stateType + " state... with refinedQuery = " + JSON.stringify(dbQuery, null, 2));

        StateModel.update(dbQuery, {
            $push: {
                "records": new record(value, metadata)
            }
        }, (err, result) => {
            if (err) {
                logger.sm("Error, Is not possible to update state with this query = " + JSON.stringify(query));
                return reject(new errorModel(500, err));
            } else {
                logger.sm("NMODIFIED record:  " + JSON.stringify(result));

                var stateSignature = "StateSignature (" + result.nModified + ") " + "[";
                for (var v in dbQuery) {
                    stateSignature += dbQuery[v];
                }
                stateSignature += "]";
                logger.sm(stateSignature);

                // Check if there already is an stete
                if (result.nModified === 0) {
                    // There is no state for Guarantee / Metric , ....
                    logger.sm("Creating new " + stateType + " state with the record...");

                    var newState = new state(value, refineQuery(stateManager.agreement.id, stateType, query), metadata);
                    var stateModel = new StateModel(newState);

                    stateModel.save(newState, (err, result) => {
                        if (err) {
                            logger.error(err.toString());
                            return reject(new errorModel(500, err));
                        } else {
                            logger.sm("Inserted new record in the new " + stateType + " state.");
                            StateModel.find(projectionBuilder(stateType, refineQuery(stateManager.agreement.id, stateType, query)), (err, result) => {
                                if (err) {
                                    logger.error(err.toString());
                                    return reject(new errorModel(500, err));
                                }
                                if (result.length != 1) {
                                    logger.error("Inconsistent DB: multiple states for query = " + JSON.stringify(refineQuery(stateManager.agreement.id, stateType, query), null, 2));
                                    logger.error("DB result = " + JSON.stringify(result, null, 2));
                                    return reject(new errorModel(500, "Inconsistent DB: multiple states for query " + JSON.stringify(refineQuery(stateManager.agreement.id, stateType, query), null, 2)));
                                } else {
                                    return resolve(result);
                                }
                            });
                        }
                    });
                } else {
                    // There is some state for Guarantee / Metric , ....
                    // Lets add a new record.
                    logger.sm("Inserted new record of " + stateType + " state.");
                    StateModel.find(projectionBuilder(stateType, refineQuery(stateManager.agreement.id, stateType, query)), (err, result) => {
                        if (err) {
                            logger.error(err.toString());
                            return reject(new errorModel(500, err));
                        }
                        if (result.length != 1) {
                            logger.error("Inconsistent DB: multiple states for query = " + JSON.stringify(refineQuery(stateManager.agreement.id, stateType, query), null, 2));
                            logger.error("DB result = " + JSON.stringify(result, null, 2));
                            return reject(new errorModel(500, "Inconsistent DB: multiple states for query " + JSON.stringify(refineQuery(stateManager.agreement.id, stateType, query), null, 2)));
                        } else {
                            return resolve(result);
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
                        logger.sm('Guarantee states for ' + guaranteeStates.guaranteeId + ' have been calculated (' + guaranteeStates.guaranteeValues.length + ') ');
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
                            logger.sm('All guarantee states have been persisted');
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
                        logger.sm('Metric states for ' + metricStates.metricId + ' have been calculated (' + metricStates.metricValues.length + ') ');
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
                            logger.sm('All metric states have been persisted');
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
                    logger.sm('All pricing states (' + pricingStates.length + ') have been calculated ');
                    return resolve(pricingStates);
                }, (err) => {
                    logger.error(err.toString());
                    return reject(new errorModel(500, err));
                });
                break;

            case "quotas":
                calculators.quotasCalculator.process(stateManager, query).then((quotasStates) => {
                    logger.sm('All quotas states (' + quotasStates.length + ') has been calculated ');
                    //putting quotas
                    return resolve(quotasStates);
                }, (err) => {
                    logger.error(err.toString());
                    return reject(new errorModel(500, err));
                });
                break;
            default:
                return reject(new errorModel(500, "There are not method implemented to calculate " + stateType + " state"));

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
        logger.sm("LogUris = " + logUris);
        if (logUris) {
            var current = states;
            if (current)
                current = getCurrent(current[0]);

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
        } else {
            logger.sm("This metric is not calculated from logs, please PUT values.")
            return resolve({
                isUpdated: true
            });
        }
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

    var newState = {
        stateType: state.stateType,
        agreementId: state.agreementId,
        id: state.id,
        scope: state.scope,
        period: state.period,
        window: state.window ? state.window : undefined,
    };

    var currentRecord = getCurrent(state);

    for (var v in currentRecord) {
        if (v != 'time' && v != 'logsState')
            newState[v] = currentRecord[v];
    }

    return newState;
}

// refines the query for a search in db
function refineQuery(agId, stateType, query) {
    var refinedQuery = {};
    refinedQuery.stateType = stateType;
    refinedQuery.agreementId = agId;

    if (query.scope)
        refinedQuery.scope = query.scope;

    if (query.period)
        refinedQuery.period = query.period;

    if (query.window)
        refinedQuery.window = query.window;

    switch (stateType) {
        case 'metrics':
            refinedQuery.id = query.metric;
            break;
        case 'guarantees':
            refinedQuery.id = query.guarantee;
            break;
    }

    return refinedQuery;
}

function projectionBuilder(stateType, query) {
    var singular = {
        guarantees: "guarantee",
        metrics: "metric",
        quotas: "quota",
        rates: "rate",
        pricing: "pricing"
    };
    var projection = {};
    var singularStateType = singular[stateType];
    if (!singularStateType) return logger.error("projectionBuilder error: stateType '%s' is not expected", stateType);

    //iterate over element in the query (scope, period...)
    for (var v in query) {
        if (query[v] instanceof Object) {
            var queryComponent = query[v];
            //if it is an object we iterate over it (e.g. period.*)
            for (var qC in queryComponent) {
                var propValue = null;
                var propName = v + "." + qC;
                propValue = queryComponent[qC];
                if (propValue != '*')
                    projection[propName] = propValue;
            }
        } else {
            //if it is not an object we add it directly (e.g. guarantee.guarantee = "K01")
            var propValue = null;
            var propName = v;
            propValue = query[v];
            if (propValue != '*')
                projection[propName] = propValue;
        }
    }

    logger.sm("Mongo projection: " + JSON.stringify(projection, null, 2));
    return projection;
}
