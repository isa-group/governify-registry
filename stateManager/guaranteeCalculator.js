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
var config = require('../config');
var logger = config.state.logger;
var errorModel = require('../errors/index.js').errorModel;
var stateManager = require('./stateManager.js');

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
            return reject(err);
        });
    });
}

function processGuarantee(agreement, guaranteeId, manager) {
    var processScopedGuarantees = [];

    return new Promise((resolve, reject) => {

        var guarantee = agreement.terms.guarantees.find(function(guarantee) {
            return guarantee.id === guaranteeId
        });

        if (!guarantee) {
            return reject('Guarantee ' + guaranteeId + ' not found.');
        }

        guarantee.of.forEach(function(ofElement) {
            processScopedGuarantees.push(processScopedGuarantee(agreement, guarantee, ofElement, manager));
        });

        Promise.all(processScopedGuarantees).then(function(values) {
            logger.info('Guarantee ' + guaranteeId + ' has been calculated');
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
            console.error(err);
            return reject(err);
        });
    });
}

function processScopedGuarantee(agreement, guarantee, ofElement, manager) {
    try {
        return new Promise((resolve, reject) => {
            var stateManager = require('./stateManager.js');
            var slo = ofElement.objective;
            var penalties = ofElement.penalties;
            var guaranteesValues = [];
            var processMetrics = [];

            var scopeWithDefault = {};
            var definedScopes = Object.keys(ofElement.scope);
            for (var guaranteeScope in guarantee.scope) {
                if (definedScopes.indexOf(guaranteeScope) > -1) {
                    scopeWithDefault[guaranteeScope] = ofElement.scope[guaranteeScope];
                } else if (guarantee.scope[guaranteeScope].default) {
                    scopeWithDefault[guaranteeScope] = guarantee.scope[guaranteeScope].default;
                }
            }

            if (ofElement.with) {
                var metrics = [];
                for (var metricId in ofElement.with) {
                    processMetrics.push(manager.get('metrics', {
                        metric: metricId,
                        scope: scopeWithDefault,
                        parameters: ofElement.with[metricId],
                        evidences: ofElement.evidences,
                        window: ofElement.window,
                        period: {
                            from: '*',
                            to: '*'
                        }
                    }));
                }
            }

            Promise.all(processMetrics).then(function(metricsValues) {
                var guaranteesValues = [];
                try {
                    metricsValues.forEach(function(metricValues) {
                        metricValues.forEach(function(metricValue) {
                            guaranteesValues.push(calculateAtomicPenalty(agreement, guarantee.id, metricValue.metric, metricValue, slo, penalties));
                        });
                    });
                    return resolve(guaranteesValues);
                } catch (err) {
                    return reject(err);
                }
            }, function(err) {
                return reject(err);
            });
        });
    } catch (err) {
        logger.error(err);
    }
}

function calculateAtomicPenalty(agreement, guaranteeId, metricId, metricValue, slo, penalties) {
    var metric = agreement.terms.metrics[metricId];
    var guaranteeValue = {};
    guaranteeValue.scope = metricValue.scope;
    guaranteeValue.window = metricValue.window;
    guaranteeValue.period = metricValue.period;
    var lastRecord = metricValue.records[metricValue.records.length - 1];
    guaranteeValue.guarantee = guaranteeId;
    vm.runInThisContext(metricId + " = " + lastRecord.value);
    var fulfilled = vm.runInThisContext(slo);
    guaranteeValue.value = fulfilled;
    guaranteeValue.metrics = {};
    guaranteeValue.metrics[metricId] = lastRecord.value;
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
                logger.error('SLO not fulfilled and no penalty found: ');
                logger.error('\t- penalty: ', penalty.of);
                logger.error('\t- metric value: ', lastRecord.value);
            }
        });
    }
    return guaranteeValue;
}