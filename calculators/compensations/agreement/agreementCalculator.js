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

var agreement;

module.exports.processCompensations = function(ag, from, to) {
    return new Promise((resolve, reject) => {
        try {
            // retrieve agreement from mongoDB
            var processGuarantees = [];
            //agreement = fs.readFileSync('SPU_IO-0.9.1.yml', 'utf8');
            agreement = ag;
            agreement.terms.guarantees.forEach(function(guarantee) {
                processGuarantees.push(processGuarantee(guarantee));
            });

            Promise.settle(processGuarantees).then(function(results) {
                console.log(results);
                for (var i = 0; i < results.length; i++) {
                    if (results[i].isFulfilled()) {
                        return resolve(results[i].value());
                    }
                }
            }, function(err) {
                return reject(err);
            });

            // $RefParser.dereference(yaml.safeLoad(agreement)).then(function(sch) {
            //     agreement = sch;
            //     agreement.terms.guarantees.forEach(function(guarantee) {
            //         processGuarantees.push(processGuarantee(guarantee));
            //     });

            //     Promise.settle(processGuarantees).then(function(results) {
            //         for (var i = 0; i < results.length; i++) {
            //             if (results[i].isFulfilled()) {
            //                 return resolve(results[i].value());
            //             }
            //         }
            //     }, function(err) {
            //         return reject(err);
            //     });

            // }).catch(function(err) {
            //     return reject(err);
            // });
        } catch (e) {
            return reject(e);
        }
    });
}

function processGuarantee(guarantee) {
    var processOfElements = [];

    // Evitar guarantee_SPU_IO_K06_C temporalmente
    if (guarantee.id !== "guarantee_SPU_IO_asd") {
        return new Promise((resolve, reject) => {
            guarantee.of.forEach(function(ofElement) {
                var scope = setScope(guarantee.scope, ofElement.def.split(','));
                processOfElements.push(processScopedGuarantee(guarantee.id, ofElement, scope));
            });

            Promise.all(processOfElements).then(function(values) {
                return resolve(values);
            }, function(err) {
                return reject(err);
            });
        });
    } else {
        console.log('Guarantee ' + guarantee.id + ' not supported yet');
    }
}

function processScopedGuarantee(guaranteeId, ofElement, scope) {
    var slo = ofElement.objective;
    var processMetrics = [];
    if (ofElement.with) {
        for (var metricId in ofElement.with) {
            processMetrics.push(processMetric(guaranteeId, metricId, scope, ofElement, slo));
        }
    }

    return new Promise((resolve, reject) => {
        Promise.all(processMetrics).then(function(values) {
            return resolve(values);
        }, function(err) {
            return reject(err);
        });
    });
}

function processMetric(guaranteeId, metricId, scope, ofElement, slo) {
    var metric = agreement.terms.metrics[metricId];
    var params = ofElement.with[metricId];
    var window = ofElement.window;
    var evidences = ofElement.evidences;
    var computerEndpoint = metric.computer;

    var data = {};
    data.scope = scope;
    data.parameters = params;

    if (evidences) {
        data.evidences = [];
        evidences.forEach(function(evidence) {
            if (evidence.computer)
                data.evidences.push(evidence.computer);
        });
    }

    if (metric.log) {
        data.log = metric.log;
    } else {
        for (var logId in agreement.context.definitions.logs) {
            var log = agreement.context.definitions.logs[logId];
            if (log.default) {
                data.log = {};
                data.log[logId] = log.uri;
            }
        }
    }

    data.window = window;

    var url = require('url');
    computerEndpoint = "http://localhost:8081/api/v1/indicators" + url.parse(computerEndpoint).path;
    console.log(computerEndpoint);

    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                'Content-Type': 'application/json'
            },
            url: computerEndpoint,
            body: JSON.stringify(data)
        }, function(err, httpResponse, response) {
            if (err) return reject(err);
            var response = yaml.safeLoad(response);
            if (Array.isArray(response)) {
                response.forEach(function(metricValue) {
                    metricValue.guarantee = guaranteeId;
                    vm.runInThisContext(metricId + " = " + metricValue.value);
                    var fulfilled = vm.runInThisContext(slo);
                    metricValue.value = fulfilled;
                    if (!fulfilled && ofElement.penalties.length > 0) {
                        metricValue.penalties = {};
                        ofElement.penalties.forEach(function(penalty) {
                            var penaltyVar = Object.keys(penalty.over)[0];
                            var penaltyFufilled = penalty.of.filter(function(compensationOf) {
                                return vm.runInThisContext(compensationOf.condition);
                            });
                            if (penaltyFufilled.length > 0) {
                                metricValue.penalties[penaltyVar] = parseFloat(penaltyFufilled[0].value);
                            }
                        });
                    }
                    return resolve(metricValue);
                })
            } else {
                reject(response);
            }
        });
    });


    // var doc = yaml.safeLoad(fs.readFileSync('metricValues.json', 'utf8'));
    // setTimeout(function() {
    //     callback(doc);
    // }, 1000);

    // metricRequests.push({
    //     "metric": metricId,
    //     "computerEndpoint": computerEndpoint,
    //     "data": data
    // });

    //console.log(data);
}

function calculateAtomicPenalty(metric) {
    console.log("\t- Calculating atomic penalty...");
    agreement.terms.guarantees.forEach()
}




function sendRequest(item, resolve, reject) {
    var doc = yaml.safeLoad(fs.readFileSync('metricValues.json', 'utf8'));
    setTimeout(function() {
        return resolve(doc, item.slo);
    }, 100);

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

    Promise.all(requests).then(function(values, slo) {
        values.forEach(function(metric) {
            metric.forEach(function(metricElem) {
                calculateAtomicPenalty(metricElem);
            });
        });
    }, function(reason) {
        console.log("Reason: " + reason)
    });
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