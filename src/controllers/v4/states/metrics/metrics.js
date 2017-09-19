/*!
governify-registry 3.0.0, built on: 2017-05-08
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var config = require('../../../../config'),
    logger = config.logger,
    ErrorModel = require('../../../../errors/index.js').errorModel,
    stateManager = require('../../../../stateManager/v3/stateManager'),
    utils = require('../../../../utils/utils');

var Query = utils.Query;
var JSONStream = require('JSONStream');


/**
 * Metrics module
 * @module metrics
 * @see module:states
 * @requires config
 * @requires bluebird
 * @requires JSONStream
 * @requires stream
 * @requires errors
 * @requires stateManager
 * */
module.exports = {
    metricsIdIncrease: _metricsIdIncrease,
    metricsIdPOST: _metricsIdPOST,
    metricsGET: _metricsGET,
    metricsIdGET: _metricsIdGET
};


/**
 * Increase metric by ID.
 * @param {Object} args {agreement: String, metric: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdIncrease
 * */
function _metricsIdIncrease(args, res) {
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var query = args.scope.value;

    logger.ctlState("New request to increase metric = %s, with values = %s", metricId, JSON.stringify(query, null, 2));

    stateManager({
        id: agreementId
    }).then(function (manager) {
        query.metric = metricId;
        manager.get('metrics', query).then(function (metric) {
            logger.ctlState("Result of getting metricValues: " + JSON.stringify(metric, null, 2));
            logger.ctlState("Query to put " + JSON.stringify(query, null, 2));
            manager.put('metrics', query, manager.current(metric[0]).value + 1).then(function (success) {
                res.json(success.map(function (element) {
                    return manager.current(element);
                }));
            }, function (err) {
                res.status(err.code).json(err);
            });
        }, function (err) {
            res.status(err.code).json(err);
        });
    }, function (err) {
        res.status(err.code).json(err);
    });
}


/**
 * Modify metric by ID.
 * @param {Object} args {agreement: String, metric: String, metricValue: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdPUT
 * */
function _metricsIdPOST(args, res) {
    var agreementId = args.agreement.value;
    var metricValue = args.metricValue.value;
    var metricId = args.metric.value;
    //var query = new Query(req.query);

    logger.info("New request to PUT metrics over: " + metricId + " with value: " + metricValue);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.put('metrics', {
            metric: metricId,
            scope: metricValue.scope,
            window: metricValue.window
        }, metricValue.value).then(function (success) {
            res.json(success.map(function (element) {
                return manager.current(element);
            }));
        }, function (err) {
            res.status(err.code).json(err);
        });
    }, function (err) {
        res.status(err.code).json(err);
    });
}


/**
 * GET all the states of all the metrics
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsPOST
 * */
function _metricsGET(req, res) {
    var args = req.swagger.params;
    var agreementId = args.agreement.value;

    logger.info("New request to GET metrics of agreement: " + agreementId);

    var result;
    if (config.streaming) {
        res.setHeader('content-type', 'application/json; charset=utf-8');
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
        logger.info("Preparing requests to /states/" + agreementId + "/metrics/{metricId} : ");

        var validationErrors = [];
        if (config.parallelProcess.metrics) {

            var promises = [];
            Object.keys(manager.agreement.terms.metrics).forEach(function (metricId) {
                var query = new Query(req.query);
                var validation = utils.validators.metricQuery(query, metricId, manager.agreement.terms.metrics[metricId]);
                if (!validation.valid) {
                    validation.metric = metricId;
                    validationErrors.push(validation);
                } else {
                    promises.push(manager.get('metrics', query));
                }
            });

            if (validationErrors.length === 0) {
                utils.promise.processParallelPromises(manager, promises, result, res, config.streaming);
            } else {
                res.status(400).json(new ErrorModel(400, validationErrors));
            }

        } else {

            var metricsQueries = [];
            Object.keys(manager.agreement.terms.metrics).forEach(function (metricId) {
                var query = new Query(req.query);
                var validation = utils.validators.metricQuery(query, metricId, manager.agreement.terms.metrics[metricId]);
                if (!validation.valid) {
                    validation.metric = metricId;
                    validationErrors.push(validation);
                } else {
                    metricsQueries.push(query);
                }
            });
            if (validationErrors.length === 0) {
                utils.promise.processSequentialPromises('metrics', manager, metricsQueries, result, res, config.streaming);
            } else {
                res.status(400).json(new ErrorModel(400, validationErrors));
            }
        }

    }, function (err) {
        logger.error("ERROR processing metrics");
        res.status(500).json(new ErrorModel(500, err));
    });
}


/**
 * GET all the states of a metric by metric's ID.
 * @param {Object} args {agreement: String, metric: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdPOST
 * */
function _metricsIdGET(req, res) {
    var args = req.swagger.params;
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var query = new Query(req.query);

    var result;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");
        res.setHeader('content-type', 'application/json; charset=utf-8');
        result = utils.stream.createReadable();
        result.pipe(JSONStream.stringify()).pipe(res);
    } else {
        logger.ctlState("### NO Streaming mode ###");
        result = [];
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {

        var validation = utils.validators.metricQuery(query, metricId, manager.agreement.terms.metrics[metricId]);
        if (!validation.valid) {
            logger.error("Query validation error");
            res.status(400).json(new ErrorModel(400, validation));
        } else {
            manager.get('metrics', query).then(function (data) {
                if (config.streaming) {
                    res.json(data.map(function (element) {
                        return manager.current(element);
                    }));
                } else {
                    data.forEach(function (element) {
                        result.push(manager.current(element));
                    });
                    result.push(null);
                }
            }, function (err) {
                logger.error(err);
                res.status(500).json(new ErrorModel(500, err));
            });
        }

    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
}