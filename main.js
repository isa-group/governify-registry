/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict"


var yaml = require('js-yaml');
var fs = require('fs');
var $RefParser = require('json-schema-ref-parser');
var request = require('request');

var schema;
var compensations = [];
var metricRequests = [];

processCompensations("SPU", "20160116", "20160215");

function processCompensations(service, from, to) {
    try {
        // retrieve agreement from mongoDB
        var doc = yaml.safeLoad(fs.readFileSync(service + '_IO-0.8.yml', 'utf8'));
        $RefParser.dereference(doc).then(function(sch) {
            schema = sch;
            for (var guaranteeId in schema.terms.guarantees) {
                console.log("Calculating compensations for guarantee \"" + guaranteeId + "\"...");
                processGuarantee(guaranteeId);

                // Once we have all metric requests ready, we send the requests to PPINOT
                sendMetricsRequests();
            }
        }).catch(function(err) {
            console.error(err);
        });
    } catch (e) {
        console.log(e);
    }
}

function processGuarantee(guaranteeId) {
    if (guaranteeId === "guarantee_SPU_IO_K06_C") {
        return;
    }
    var guarantee = schema.terms.guarantees[guaranteeId];
    if (guarantee) {
        for (var ofElementId in guarantee.of) {
            var ofElement = guarantee.of[ofElementId];
            var scope = setScope(guarantee.scope, ofElementId.split(','));
            processScopedGuarantee(ofElement, scope);
        }
    } else {
        console.error("Guarantee \"" + guaranteeId + "\" cannot be found.");
    }
}

function processScopedGuarantee(ofElement, scope) {
    var slo = ofElement.objective;
    console.log("\t- Service Level Objective: " + slo);
    if (ofElement.with) {
        for (var metricId in ofElement.with) {
            console.log("\t- Processing Metric \"" + metricId + "\"...");
            processMetric(metricId, scope, ofElement);
        }
    }
}

function processMetric(metricId, scope, ofElement) {
    var metric = schema.terms.metrics[metricId];
    var params = ofElement.with[metricId];
    var window = ofElement.window;
    var evidences = ofElement.evidences;
    var computerEndpoint = metric.computer;

    var data = {};
    data.scope = scope;
    data.parameters = params;

    if (evidences) {
        data.evidences = [];
        for (var evidenceId in evidences) {
            var evidence = evidences[evidenceId];
            data.evidences.push(evidence.computer);
        }
    }

    if (metric.log) {
        data.log = metric.log;
    } else {
        for (var logId in schema.context.definitions.logs) {
            var log = schema.context.definitions.logs[logId];
            if (log.default) {
                data.log = {};
                data.log[logId] = log.uri;
            }
        }
    }

    data.window = window;
    metricRequests.push({
        "metric": metricId,
        "computerEndpoint": computerEndpoint,
        "data": data
    });

    //console.log(data);
    return;
}

function sendRequest(item, resolve, reject) {
    var doc = yaml.safeLoad(fs.readFileSync('metricValues.json', 'utf8'));
    setTimeout(resolve(item), 100, doc);

    /*
    request.post({
        url: item.computerEndpoint,
        body: JSON.stringify(item.data)
    }, function(err, httpResponse, body) {
        //metricResponses.push(body);
        if (err) return reject(err);
        return resolve(body);
    });
    */
}

function sendMetricsRequests() {

    let requests = metricRequests.map((item) => {
        return new Promise((resolve, reject) => {
            sendRequest(item, resolve, reject);
        });
    });

    Promise.all(requests).then(function(values) {
        values.forEach(function(metric) {
            console.log(metric);
            metric.forEach(function(metricElem) {
                console.log(metricElem.value);
            });
        });
    }, function(reason) {
        console.log("Reason: " + reason)
    });

    //var metricResponses = [];
    //var completed_requests = 0;
    // for (var req in metricRequests) {
    //     request.post({
    //         url: req.computerEndpoint,
    //         body: req.data
    //     }, function(err, httpResponse, body) {
    //         metricResponses.push(body);
    //         completed_requests++;
    //         if (completed_requests === metricRequests.length) {
    //             calculateAtomicPenalty(req.metric, metricResponses);
    //         }
    //     });
    // }
}

function calculateAtomicPenalty(metricResponses) {
    console.log("\t- Calculating atomic penalty...");

    metricResponses.forEach(function(metric) {
        metric.forEach(function(metricElem) {
            console.log(metricElem);
        });

    });

}

function calculateAtomicPenalty(metricId, metricResponses) {
    for (var metricIdResponse in metricResponses) {
        var metricResponse = metricResponses[metricIdResponse];
        console.log(metricResponse);
    }
}

function setScope(guaranteeScope, scopeValues) {
    var result = {};
    var i = 0;
    for (var scopeId in guaranteeScope) {
        var scope = guaranteeScope[scopeId];
        if (scopeValues[i])
            result[scopeId] = scopeValues[i];
        else if (scope.default) {
            result[scopeId] = scope.default;
        } else {
            delete result[scopeId];
        }
        i++;
    }
    return result;
}