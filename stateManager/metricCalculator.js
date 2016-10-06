"use strict";

var config = require('../config');
var logger = config.logger;

var Promise = require("bluebird");
var yaml = require('js-yaml');
var request = require('request');

/**
 * Metric calculator module.
 * @module metricCalculator
 * @requires config
 * @requires bluebird
 * @requires js-yaml
 * @requires request
 * @see module:calculators
 * */
module.exports = {
    process: processMetric
};


/**
 * Process all metrics.
 * @param {object} agreement agreement
 * @param {object} metricId metric ID
 * @param {object} metricParameters metric parameters
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
            logger.metrics("Sending request to computer (" + computerEndpoint + ") with payload: " + JSON.stringify(data, null, 2));

            request.post({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: computerEndpoint,
                body: JSON.stringify(data)
            }, function (err, httpResponse, response) {
                logger.metrics('Processing metric ' + metricId + ' response from computer ');
                //logger.metrics('response from computer: ' + JSON.stringify(response, null, 2));
                if (err) {
                    logger.error("Error in PPINOT Computer response", err);
                    return reject(err);
                }

                if (!response) {
                    logger.error("Error in PPINOT Computer response");
                    return reject("Error in PPINOT Computer response");
                }

                try {
                    response = yaml.safeLoad(response);
                    logger.metrics('Processing column name bindings from log...');
                    if (response && Array.isArray(response)) {
                        response.forEach(function (metricState) {
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
                        });
                        logger.metrics('Column name bindings processed');
                        return resolve({
                            metricId: metricId,
                            metricValues: response
                        });
                    } else {
                        logger.error('Error in computer response. Response is not an array: ', JSON.stringify(response, null, 2));
                        return reject('There was a problem retrieving indicator ' + metricId);
                    }
                } catch (error) {
                    logger.error("Error in computer response: " + JSON.stringify(error, null, 2) + "\nResponse: " + JSON.stringify(response, null, 2));
                    return reject("Error in computer response: " + JSON.stringify(error, null, 2) + "\nResponse: " + JSON.stringify(response, null, 2));
                }
            });
        } catch (err) {
            logger.error('Error processing metric: ' + metricId + ': ', JSON.stringify(err, null, 2));
            return reject('Error processing metric: ' + metricId + ': ' + JSON.stringify(err, null, 2));
        }
    });

}