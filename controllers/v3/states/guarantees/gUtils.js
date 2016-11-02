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
    penaltyMetric: _PenaltyMetric,
    checkQuery: _checkQuery,
    buildGuaranteeQuery: _buildGuaranteeQuery
};

/**
 * This method return a well formed query for stateManager.
 * @param {String} guranteeId Id of guarantee which will be calculated
 * @param {ISODateString} from YYYY-MM-DDTHH:mm:ss.SSSZ
 * @return {ISODateString} to YYYY-MM-DDTHH:mm:ss.SSSZ
 * @alias module:gUtils.getPeriods
 * */
function _buildGuaranteeQuery(guaranteeId, from, to) {
    var query = {};
    query.guarantee = guaranteeId;
    if (from) {
        query.period = {};
        query.period.from = from;
    }
    if (to) {
        query.period.to = to;
    }
    return query;
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
                ret = ret && _checkQuery(state[v], query[v]);
            } else {
                if ((state[v] !== query[v] && query[v] != "*") || !state[v]) {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}
