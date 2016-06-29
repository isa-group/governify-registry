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
        data.scope = metricParameters.scope;
        data.parameters = metricParameters.parameters;

        if (metricParameters.evidences) {
            data.evidences = [];
            var evidence;
            for (var evidenceId in metricParameters.evidences) {
                evidence = metricParameters.evidences[evidenceId];
                if (evidence.computer)
                    data.evidences.push({
                        id: evidenceId,
                        computer: evidence.computer
                    });
            }
        }

        if (metric.log) {
            data.logs = metric.log;
        } else {
            for (var logId in agreement.context.definitions.logs) {
                var log = agreement.context.definitions.logs[logId];
                if (log.default) {
                    data.logs = {};
                    data.logs[logId] = log.uri;
                }
            }
        }

        data.window = metricParameters.window;

        // var url = require('url');
        // computerEndpoint = "http://localhost:8081/" + url.parse(computerEndpoint).path;
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
                var response = yaml.safeLoad(response);
                if (response && Array.isArray(response)) {
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