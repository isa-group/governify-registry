/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict"

var yaml = require('js-yaml');
var fs = require('fs');
var $RefParser = require('json-schema-ref-parser');
var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');

module.exports = {
    process: processMetric
}

function processMetric(agreement, metricId, metricParameters) {
    try {
        var metric = agreement.terms.metrics[metricId];
        var computerEndpoint = metric.computer;

        var data = {};

        data.parameters = metricParameters.parameters;

        // if (metricParameters.evidences) {
        //     data.evidences = [];
        //     var evidence;
        //     for (var evidenceId in metricParameters.evidences) {
        //         evidence = metricParameters.evidences[evidenceId];
        //         if (evidence.computer)
        //             data.evidences.push({
        //                 id: evidence.id,
        //                 computer: evidence.computer
        //             });
        //     }
        // }

        var scope = {};
        if (metric.log) {
            data.logs = metric.log;
            for (var metricScope in metricParameters.scope) {
                var logScope = log.scopes[metric.scope.id][metricScope];
                if (log.scopes[metric.scope.id] && logScope) {
                    scope[logScope] = metricParameters.scope[metricScope];
                }
            }
            data.scope = scope;
        } else {
            for (var logId in agreement.context.definitions.logs) {
                var log = agreement.context.definitions.logs[logId];
                if (log.default) {
                    data.logs = {};
                    data.logs[logId] = log.uri;
                    for (var metricScope in metricParameters.scope) {
                        var scopeId = Object.keys(metric.scope)[0];
                        if (log.scopes[scopeId]) {
                            var logScope = log.scopes[scopeId][metricScope];
                            scope[logScope] = metricParameters.scope[metricScope];
                        }
                    }
                }
            }
            data.scope = scope;
        }

        data.window = metricParameters.window;

        /*var url = require('url');
        computerEndpoint = "http://ppinot.computer.sas-devel.governify.io" + url.parse(computerEndpoint).path;*/

        return new Promise((resolve, reject) => {
            request.post({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: computerEndpoint,
                body: JSON.stringify(data)
            }, function(err, httpResponse, response) {
                //console.log('- Processing metric ' + metricId + ' (' + JSON.stringify(metricParameters.scope) + ')');
                if (err) return reject(err)
                response = yaml.safeLoad(response);
                // PROCESAR VARIABLES DEL SCOPE NODO -> node
                // PROCESAR VARIABLES DEL SCOPE CENTRO -> center
                var log;
                for (var logId in agreement.context.definitions.logs) {
                    var l = agreement.context.definitions.logs[logId];
                    if (l.default) {
                        log = l;
                    }
                }
                if (response && Array.isArray(response)) {
                    response.forEach(function(m) {
                        var scope = {};
                        for (var metricScope in m.scope) {
                            var scopeId = Object.keys(metric.scope)[0];
                            if (log.scopes[scopeId]) {
                                var logScope = log.scopes[scopeId][metricScope];
                                scope[logScope] = metricParameters.scope[metricScope];
                            }
                        }
                    });
                    return resolve({
                        metricId: metricId,
                        metricValues: response
                    });
                } else {
                    return reject('There was a problem retrieving indicator ' + metricId);
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
}
