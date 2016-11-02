'use strict';

var config = require('../../../../config');
var logger = config.logger;
var errorModel = require('../../../../errors/index.js').errorModel;
var stateManager = require('../../../../stateManager/v2/stateManager.js');
var gUtils = require('./gUtils.js');
var utils = require('../../../../utils/utils.js')
var Promise = require('bluebird');
var JSONStream = require('JSONStream');
var moment = require('moment');


/**
 * Guarantees module
 * @module guarantees
 * @see module:states
 * @requires config
 * @requires bluebird
 * @requires JSONStream
 * @requires stream
 * @requires errors
 * @requires stateManager
 * @requires gUtils
 * */
module.exports = {
    guaranteesGET: _guaranteesGET,
    guaranteeIdGET: _guaranteeIdGET,
    guaranteeIdPenaltyPOST: _guaranteeIdPenaltyPOST
};

/**
 * Get all guarantees.
 * @param {Object} args {agreement: String, from: String, to: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteesGET
 * */
function _guaranteesGET(args, res, next) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;
    var from = args.from.value;
    var to = args.to.value;

    var result;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");
        result = utils.stream.createReadable();

        result.pipe(JSONStream.stringify()).pipe(res);
    } else {
        logger.ctlState("### NO Streaming mode ###");
        result = [];
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {
        logger.ctlState("Getting state of guarantees...");

        var guaranteesPromises = [];
        manager.agreement.terms.guarantees.forEach(function (guarantee) {
            var query = gUtils.buildGuaranteeQuery(guarantee.id, from, to);
            guaranteesPromises.push(manager.get('guarantees', query));
        });

        if (config.parallelProcess.guarantees) {

            logger.ctlState("### Process mode = PARALLEL ###");
            utils.promise.processParallelPromises(manager, guaranteesPromises, result, res, config.streaming);

        } else {

            logger.ctlState("### Process mode = SEQUENTIAL ###");
            utils.promise.processSequentialPromises(manager, guaranteesPromises, result, res, config.streaming);

        }
    }, function (err) {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}


/**
 * Get guarantees by ID.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteeIdGET
 * */
function _guaranteeIdGET(args, res, next) {
    logger.ctlState("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;
    var from = args.from.value;
    var to = args.to.value;

    res.setHeader('content-type', 'application/json; charset=utf-8');
    var query = gUtils.buildGuaranteeQuery(guaranteeId, from, to);

    var ret;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");
        ret = utils.stream.createReadable();

        ret.pipe(JSONStream.stringify()).pipe(res);
    } else {
        logger.ctlState("### NO Streaming mode ###");
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {

        manager.get('guarantees', query).then(function (success) {
            if (config.streaming) {
                res.json(success.map((element) => {
                    return manager.current(element);
                }));
            } else {
                success.forEach(function (element) {
                    ret.push(manager.current(element));
                });
                ret.push(null);
            }
        }, function (err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });
    }, function (err) {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}


/**
 * Post gurantee penalty by ID.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteeIdPenaltyPOST
 * */
function _guaranteeIdPenaltyPOST(args, res, next) {
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;

    logger.ctlState("With offset = " + offset);

    stateManager({
        id: agreementId
    }).then(function (manager) {

        var periods = utils.time.getPeriods(manager.agreement, query.window);
        logger.warning("periods: " + JSON.stringify(periods, null, 2));
        var result = [];
        Promise.each(periods, function (element) {
            var p = {
                from: moment.utc(moment.tz(element.from, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString(),
                to: moment.utc(moment.tz(element.to, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString()
            };
            //  logger.ctlState("Query before parse: " + JSON.stringify(query, null, 2));
            var logId = Object.keys(query.logs)[0];
            var log = manager.agreement.context.definitions.logs[logId];
            var scope = {};
            var scopeId = Object.keys(log.scopes)[0];
            var logScopes = Object.keys(log.scopes[scopeId]).map(function (key) {
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
            logger.warning("Query after parse: " + JSON.stringify(p, null, 2));
            return manager.get('guarantees', {
                guarantee: guaranteeId,
                scope: query.scope,
                period: p
                    //  period: p //,
                    //  window: query.window
            }).then(function (success) {
                var ret = [];
                for (var i in success) {
                    var e = success[i];
                    //logger.ctlState("Comparing period:  " + e.period.from + ">=" + p.from + " && " + e.period.to + "<=" + p.to);
                    if (moment(e.period.from).isSameOrAfter(p.from) && moment(e.period.to).isSameOrBefore(p.to) && gUtils.checkQuery(e, query)) {
                        ret.push(e);
                    }
                }
                //logger.ctlState("Resultado para el periodo : " + JSON.stringify(element) + "=>\n" + JSON.stringify(ret, null, 2));

                for (var i in ret) {
                    if (manager.current(ret[i]).penalties) {
                        var penalties = manager.current(ret[i]).penalties;
                        for (var penaltyI in penalties) {
                            logger.warning("element: " + JSON.stringify(element, null, 2));
                            result.push(new gUtils.penaltyMetric(ret[i].scope, query.parameters, element, query.logs, penaltyI, penalties[penaltyI]));
                        }
                    }
                }

            }, function (err) {
                logger.error(err);
                //res.status(500).json(new errorModel(500, err));
            });

        }).then(function () {

            res.json(result);

        }, function (err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });

    }, function (err) {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}
