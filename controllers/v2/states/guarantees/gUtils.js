'use strict';
/**
 * Utils that are required in guarantees controllers.
 */

/** Promise dependencies**/
var Promise = require("bluebird");

/**
 * This method return a set of periods which are based on a window parameter.
 *
 * Examples:
 *
 *    var periods  = getPeriods(agreement, window)
 *
 * @param {AgreementModel} agreement
 * @param {WindowModel} window
 *
 * @return {Set} periods
 * @api public
 */
module.exports.getPeriods = function (agreement, window) {
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
 *
 * Examples:
 *
 *    var periods  = new penaltyMetric (scope, parameters, periods, logs, penaltyName, penaltyValue);
 *
 * @param {ScopeModel} scope
 * @param {ParametersModel} parameters
 * @param {PeriodModel} period
 * @param {LogsModel} logs
 * @param {String} penaltyName
 * @param {Number} penaltyValue
 *
 * @return {Object} penaltyMetric
 * @api public
 */
module.exports.penaltyMetric = function PenaltyMetric(scope, parameters, period, logs, penaltyName, penaltyValue) {
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.penalty = penaltyName;
    this.value = penaltyValue;
    this.logs = logs;
}

/**
 * This method return 'true' or 'false' when check if query is complied.
 *
 * Examples:
 *
 *    if( checkQuery(state, query) )
 *
 * @param {StateModel} state
 * @param {QueryModel} query
 *
 * @return {Boolean} ret
 * @api public
 */
module.exports.checkQuery = function (state, query) {
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

module.exports.processMode = function (mode, stateType, query, manager, resolve, reject) {
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