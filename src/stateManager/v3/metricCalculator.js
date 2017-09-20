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


"use strict";

var config = require('../../config'),
    logger = config.logger,
    Promise = require('bluebird'),
    request = require('request'),
    JSONStream = require('JSONStream'),

    utils = require('../../utils/utils');

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

            /**### BUILD COMPUTER REQUEST BODY ###**/
            var data = {};
            data.parameters = metricParameters.parameters;
            data.window = metricParameters.window;

            if (metricParameters.evidences) {
                data.evidences = metricParameters.evidences;
            }

            //Select logs data. If metric has not log select by default log.
            var logDefinition, logId;
            if (metric.log) {
                logId = Object.keys(metric.log)[0]; //controlate this potential error
                if (!logId) { throw new Error('The log field of metric is not well defined in the agreement'); }
                logDefinition = metric.log[logId];
            } else {
                //Search default log
                var agLogs = agreement.context.definitions.logs;
                for (var l in agLogs) {
                    if (agLogs[l].default) {
                        logId = l;
                        logDefinition = agLogs[l];
                        break;
                    }
                }
                if (!logDefinition) { throw new Error('Agreement is not well defined. It Must has at least a default log.') }
            }
            //Build logs field on computer request body //, measures, holidays
            var LogField = function (uri, stateUri) {
                if (!uri || !stateUri) {
                    throw new Error('The log field of metric is not well defined in the agreement, uri and stateUri are required fields.');
                }
                this.uri = uri;
                this.stateUri = stateUri;
                // if (measures) { this.measures = measures };
                // if (holidays) { this.holidays = holidays };
            };
            data.log = {};
            data.log[logId] = new LogField(
                logDefinition.uri,
                logDefinition.stateUri
            );
            // Mapping of columns names in log
            var scope = utils.scopes.registryToComputerParser(metricParameters.scope, logDefinition.scopes);

            // adding computer config
            var Config = function (measures, holidays) {
                this.measures = measures;
                if (holidays) { this.holidays = holidays; }
            }

            data.config = new Config(
                logDefinition.measures,
                logDefinition.holidays || null
            )

            if (!data.log) {
                return reject('Log not found for metric ' + metricId + '. ' +
                    'Please, specify metric log or default log.');
            }

            data.scope = Object.keys(scope).length > 0 ? scope : metricParameters.scope;
            logger.metrics("Sending request to computer (" + computerEndpoint + ") with payload: " + JSON.stringify(data, null, 2));

            var compositeResponse = [];

            var objectToUrlParser = (object, raiz) => {
                var string = "";
                for (var f in object) {
                    var field = object[f];
                    if (field instanceof Object && !(field instanceof Array)) {
                        string += objectToQuery(field, (raiz ? raiz + '.' : '') + f);
                    } else if (field instanceof Array) {
                        string += f + '=' + field.map((e) => { return e.id; }).join(',');
                        string += '&';
                    } else {
                        string += (raiz ? raiz + '.' : '') + f + '=' + field + '&';
                    }
                }
                return string;
            };

            var urlParams = objectToUrlParser(data);

            var computerRequest = request.post({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: computerEndpoint,
                body: JSON.stringify(data)
            }).on('response', function (httpResponse) {
                if (httpResponse.statusCode !== 200) {
                    logger.error("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                    return reject("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                }
                computerRequest.pipe(JSONStream.parse()).on('data', function (monthMetrics) {
                    try {

                        logger.metrics('Processing mapping of columns names in log...');

                        if (monthMetrics && Array.isArray(monthMetrics)) {
                            monthMetrics.forEach(function (metricState) {
                                if (metricState.logs && metric.scope) {

                                    //Getting the correct log for scope mapping
                                    var logId = Object.keys(metricState.logs)[0];
                                    var log = agreement.context.definitions.logs[logId];
                                    //doing scope mapping
                                    metricState.scope = utils.scopes.computerToRegistryParser(metricState.scope, log.scopes);

                                } else {
                                    throw new Error('Fields metricState.logs and metric.scope are required in computer response.')
                                }
                                compositeResponse.push(metricState);
                            });
                            logger.metrics('Mapping of columns names in log processed.');

                        } else {
                            logger.error('Error in computer response. Response is not an array: ', JSON.stringify(monthMetrics, null, 2));
                            return reject('There was a problem retrieving indicator ' + metricId);
                        }

                    } catch (error) {
                        logger.error("Error in computer response: " + error.toString() + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                        return reject("Error in computer response: " + error.toString() + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                    }

                }).on('end', function () {
                    return resolve({
                        metricId: metricId,
                        metricValues: compositeResponse
                    });
                });
            });
        } catch (err) {
            logger.error('Error processing metric: ' + metricId + ': ', err);
            return reject('Error processing metric: ' + metricId + ': ' + JSON.stringify(err.toString(), null, 2));
        }
    });

}