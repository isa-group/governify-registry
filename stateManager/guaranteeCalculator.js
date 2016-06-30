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
var clone = require('clone');

var metricCalculator = require('./metricCalculator')

module.exports = {
    processAll: processGuarantees,
    process: processGuarantee
}

function processGuarantees(agreement) {
    return new Promise((resolve, reject) => {
        var processGuarantees = [];
        agreement.terms.guarantees.forEach(function(guarantee) {
            processGuarantees.push(processGuarantee(agreement, guarantee.id));
        });
        Promise.settle(processGuarantees).then(function(results) {
            if (results.length > 0) {
                var values = [];
                for (var i = 0; i < results.length; i++) {
                    if (results[i].isFulfilled()) {
                        if (results[i].value().length > 0) {
                            results[i].value().forEach(function(guaranteeValue) {
                                values.push(guaranteeValue);
                            });
                        }
                    }
                }
                return resolve(values);
            } else {
                return reject('Error processing guarantee: empty result');
            }

        }, function(err) {
            console.error(err);
            return reject(err);
        });
    });
}

function processGuarantee(agreement, guaranteeId) {
    var processScopedGuarantees = [];

    return new Promise((resolve, reject) => {

        var guarantee = agreement.terms.guarantees.find(function(guarantee) {
            return guarantee.id === guaranteeId
        });

        if (!guarantee) {
            return reject('Guarantee ' + guaranteeId + ' not found.');
        }

        guarantee.of.forEach(function(ofElement) {
            processScopedGuarantees.push(processScopedGuarantee(agreement, guaranteeId, ofElement));
        });

        Promise.all(processScopedGuarantees).then(function(values) {
            console.log('Guarantee ' + guaranteeId + ' has been calculated');
            var guaranteeValues = [];
            values.forEach(function(scopedValues) {
                if (scopedValues.length > 0) {
                    scopedValues.forEach(function(scopedValue) {
                        guaranteeValues.push(scopedValue);
                    });
                }
            });
            return resolve(guaranteeValues);
        }, function(err) {
            return reject(err);
        });
    });
}

function processScopedGuarantee(agreement, guaranteeId, ofElement) {
    try {
        return new Promise((resolve, reject) => {
            var slo = ofElement.objective;
            var penalties = ofElement.penalties;
            var processMetrics = [];
            if (ofElement.with) {
                var metrics = [];
                for (var metricId in ofElement.with) {
                    var metricParams = {
                        scope: ofElement.scope,
                        parameters: ofElement.with[metricId],
                        evidences: ofElement.evidences,
                        window: ofElement.window
                    }

                    processMetrics.push(metricCalculator.process(agreement, metricId, metricParams));
                }
            }

            Promise.all(processMetrics).then(function(metricsValues) {
                var guaranteesValues = [];
                try {
                    metricsValues.forEach(function(metricValuesWrapper) {
                        metricValuesWrapper.metricValues.forEach(function(metricValue) {
                            guaranteesValues.push(calculateAtomicPenalty(agreement, guaranteeId, metricValuesWrapper.metricId, metricValue, slo, penalties));
                        });
                    });
                } catch (err) {
                    return reject(err);
                }

                return resolve(guaranteesValues);
            }, function(err) {
                return reject(err);
            });
        });
    } catch (err) {
        console.error(err);
    }
}

function calculateAtomicPenalty(agreement, guaranteeId, metricId, metricValue, slo, penalties) {
    var metric = agreement.terms.metrics[metricId];
    var guaranteeValue = clone(metricValue);
    guaranteeValue.guarantee = guaranteeId;
    vm.runInThisContext(metricId + " = " + metricValue.value);
    var fulfilled = vm.runInThisContext(slo);
    guaranteeValue.value = fulfilled;
    guaranteeValue.metrics = {};
    guaranteeValue.metrics[metricId] = metricValue.value;
    if (!fulfilled && penalties.length > 0) {
        guaranteeValue.penalties = {};
        penalties.forEach(function(penalty) {
            var penaltyVar = Object.keys(penalty.over)[0];
            var penaltyFufilled = penalty.of.filter(function(compensationOf) {
                return vm.runInThisContext(compensationOf.condition);
            });
            if (penaltyFufilled.length > 0) {
                guaranteeValue.penalties[penaltyVar] = parseFloat(vm.runInThisContext(penaltyFufilled[0].value));
            } else {
                console.log('\n');
                console.log('SLO not fulfilled and no penalty found: ');
                console.log('\t- penalty: ', penalty.of);
                console.log('\t- metric value: ', metricValue.value);
                console.log('\n');
            }
        });
    }
    return guaranteeValue;
}