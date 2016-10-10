'use strict';

var config = require('../../../../config');
var logger = config.logger;

var Promise = require('bluebird');
var moment = require('moment');


/**
 * Utils that are required in guarantees controller module
 * @module gUtils
 * @requires config
 * @requires bluebird
 * @requires moment
 * */
module.exports = {
    getPeriods: _getPeriods,
    penaltyMetric: _PenaltyMetric,
    checkQuery: _checkQuery,
    processMode: _processMode
};


/** 
 * This method return a set of periods which are based on a window parameter.
 * @param {AgreementModel} agreement agreement model passed
 * @param {WindowModel} window window model passed 
 * @return {Set} set of periods
 * @alias module:gUtils.getPeriods
 * */
function _getPeriods(agreement, window) {
    var periods = [];
    var Wfrom = moment.utc(moment.tz(window.initial, agreement.context.validity.timeZone));
    var current = moment.utc();
    var from = moment.utc(Wfrom),
            to = moment.utc(Wfrom).add(1, "months").subtract(1, "milliseconds");
    while (!to || to.isSameOrBefore(current)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months"));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));
    }

    return periods;
}


/** 
 * Constructor for a metric of type penalty.
 * @param {ScopeModel} scope scope
 * @param {ParametersModel} parameters parameters
 * @param {PeriodModel} period period
 * @param {LogsModel} logs logs
 * @param {String} penaltyName penalty name
 * @param {Number} penaltyValue penalty value
 * @return {Object} penalty metric
 * @alias module:gUtils.penaltyMetric
 * */
function _PenaltyMetric(scope, parameters, period, logs, penaltyName, penaltyValue) {
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.penalty = penaltyName;
    this.value = penaltyValue;
    this.logs = logs;
}


/** 
 * This method return 'true' or 'false' when check if query is complied.
 * @param {StateModel} state state
 * @param {QueryModel} query query
 * @return {Boolean} ret
 * @alias module:gUtils.checkQuery
 * */
function _checkQuery(state, query) {
    var ret = true;
    for (var v in query) {
        if (v != "parameters" && v != "evidences" && v != "logs" && v != "window") {
            if (query[v] instanceof Object) {
                ret = ret && checkQuery(state[v], query[v]);
            } else {
                if ((state[v] !== query[v] && query[v] != "*") || !state[v]) {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}


/** 
 * Process mode.
 * @param {Object} mode mode
 * @param {Object} stateType state type
 * @param {Object} query query
 * @param {Object} manager manager
 * @param {Object} resolve resolve
 * @param {Object} reject reject
 * @alias module:gUtils.processMode
 * */
function _processMode(mode, stateType, query, manager, resolve, reject) {
    /** if mode is 'true' processMode is parallel **/
    var managerGetPromise = [];
    manager.agreement.terms[stateType].forEach(function (guarantee) {
        managerGetPromise.push(manager.get(stateType, {
            guarantee: guarantee.id
        }));
    });
    var results = [];
    if (mode) {
        logger.ctlState("### Process mode = PARALLEL ###");
        return Promise.settle(managerGetPromise).then(function (promisesResults) {
            if (promisesResults.length > 0) {
                for (var r in promisesResults) {
                    var onePromiseResults = promisesResults[r];
                    if (onePromiseResults.isFulfilled()) {
                        onePromiseResults.value().forEach(function (value) {
                            results.push(manager.current(value));
                        });
                    }
                }
                return resolve(results);
            } else {
                var err = 'Error processing guarantee: empty result';
                logger.error(err);
                return reject(err);
            }
        }, function (err) {
            logger.error(err);
            return reject(err);
        });

    } else {
        logger.ctlState("### Process mode = SEQUENTIAL ###");
        return Promise.each(managerGetPromise, function (promise) {
            return promise.then(resolve, reject);
        });
    }
}