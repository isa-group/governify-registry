"use strict";

var config = require('../../config');
var logger = config.logger;

var Promise = require('bluebird');
var yaml = require('js-yaml');
var request = require('request');
var JSONStream = require('JSONStream');

/**
 * Metric calculator module.
 * @module metricCalculator
 * @requires config
 * @requires bluebird
 * @requires js-yaml
 * @requires request
 * @requires JSONStream
 * @see module:calculators
 * */
module.exports = {
    process: processMetric
};


/**
 * Process all metrics.
 * @param {Object} agreement agreement
 * @param {Object} metricId metric ID
 * @param {Object} metricParameters metric parameters
 * @alias module:metricCalculator.process
 * */
function processMetric(agreement, metricId, metricParameters) {
    return new Promise(function (resolve, reject) {
        try {
            var metric = agreement.terms.metrics[metricId];
            if (!metric) {
                return reject('Metric ' + metricId + ' not found.');
            }
            var computerEndpoint = metric.computer;

            var data = {};
            data.parameters = metricParameters.parameters;
            data.window = metricParameters.window;

            if (metricParameters.evidences) {
                data.evidences = metricParameters.evidences;
            }

            // Binding of columns names in log
            var scope = {};
            var log;
            if (metric.log) {
                // Binding of columns names in custom log
                data.logs = {};
                var logId = Object.keys(metric.log)[0];
                data.logs[logId] = metric.log[logId].uri;
                var scopeId = Object.keys(metric.scope)[0];
                for (var metricScope in metricParameters.scope) {
                    var logScope = metric.log[logId].scopes[scopeId][metricScope];
                    if (metric.log[logId].scopes[scopeId] && logScope) {
                        scope[logScope] = metricParameters.scope[metricScope];
                    } else {
                        scope[metricScope] = metricParameters.scope[metricScope];
                    }
                }
            } else {
                // Binding of columns names in default log
                for (var logId in agreement.context.definitions.logs) {
                    var log = agreement.context.definitions.logs[logId];
                    if (log.default) {
                        data.logs = {};
                        data.logs[logId] = log.uri;
                        var scopeId = Object.keys(metric.scope)[0];
                        for (var metricScope in metricParameters.scope) {
                            if (log.scopes[scopeId] && log.scopes[scopeId][metricScope]) {
                                var logScope = log.scopes[scopeId][metricScope];
                                scope[logScope] = metricParameters.scope[metricScope];
                            } else {
                                scope[metricScope] = metricParameters.scope[metricScope];
                            }
                        }
                        break;
                    }
                }
            }

            if (!data.logs) {
                return reject('Log not found for metric ' + metricId + '. ' +
                    'Please, specify metric log or default log.');
            }

            data.scope = scope ? scope : metricParameters.scope;
            logger.warning("Sending request to computer (" + computerEndpoint + ") with payload: " + JSON.stringify(data, null, 2));

            var compositeResponse = [];
            var computerRequest = request.post({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: computerEndpoint,
                body: JSON.stringify(data)
            }).on('response', (httpResponse) => {
                if (httpResponse.statusCode !== 200) {
                    logger.error("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                    return reject("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                }
                computerRequest.pipe(JSONStream.parse()).on('data', (monthMetrics) => {
                    //console.log(monthMetrics);
                    try {
                        //monthMetrics = yaml.safeLoad(monthMetrics);
                        logger.metrics('Processing column name bindings from log...');
                        if (monthMetrics && Array.isArray(monthMetrics)) {
                            monthMetrics.forEach(function (metricState) {
                                if (metricState.logs) {
                                    var logId = Object.keys(metricState.logs)[0];
                                    var log = agreement.context.definitions.logs[logId];
                                    var scope = {};
                                    var scopeId = Object.keys(metric.scope)[0];
                                    var logScopes = Object.keys(log.scopes[scopeId]).map(function (key) {
                                        return log.scopes[scopeId][key];
                                    });
                                    for (var metricScope in metricState.scope) {
                                        if (logScopes.indexOf(metricScope) > -1) {
                                            for (var logScope in log.scopes[scopeId]) {
                                                if (log.scopes[scopeId][logScope] === metricScope) {
                                                    scope[logScope] = metricState.scope[metricScope];
                                                }
                                            }
                                        } else {
                                            scope[metricScope] = metricState.scope[metricScope];
                                        }
                                    }
                                    metricState.scope = scope ? scope : metricState.scope;
                                }
                                compositeResponse.push(metricState);
                            });
                            logger.metrics('Column name bindings processed');
                        } else {
                            logger.error('Error in computer response. Response is not an array: ', JSON.stringify(monthMetrics, null, 2));
                            return reject('There was a problem retrieving indicator ' + metricId);
                        }
                    } catch (error) {
                        logger.error("Error in computer response: " + JSON.stringify(error, null, 2) + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                        return reject("Error in computer response: " + JSON.stringify(error, null, 2) + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                    }
                }).on('end', () => {
                    return resolve({
                        metricId: metricId,
                        metricValues: compositeResponse
                    });
                });
            });
        } catch (err) {
            logger.error('Error processing metric: ' + metricId + ': ', JSON.stringify(err, null, 2));
            return reject('Error processing metric: ' + metricId + ': ' + JSON.stringify(err, null, 2));
        }
    });

}
