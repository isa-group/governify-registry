"use strict"

var yaml = require('js-yaml');
var fs = require('fs');
var $RefParser = require('json-schema-ref-parser');
var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var clone = require('clone');
var config = require('../config');
var logger = config.logger;
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
            processScopedGuarantees.push({
                agreement: agreement,
                guarantee: guarantee,
                ofElement: ofElement,
                manager: manager
            });
        });


        var guaranteesValues = [];

        logger.guarantees('Processing scoped guarantee (' + guarantee.id + ')...');
        Promise.each(processScopedGuarantees, function(guaranteeParam) {
            return processScopedGuarantee(guaranteeParam.agreement, guaranteeParam.guarantee, guaranteeParam.ofElement, guaranteeParam.manager).then(function(value) {
                logger.guarantees('Scoped guarantee has been processed');
                guaranteesValues = guaranteesValues.concat(value);
            }).catch(function(err) {
                logger.error('Error processing scoped guarantee: ', err);
                return reject(err);
            });

        }).then(function() {
            logger.guarantees('All scoped guarantees have been processed');
            return resolve({
                guaranteeId: guaranteeId,
                guaranteeValues: guaranteesValues
            });
        }).catch(function(err) {
            logger.error(err);
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
                    processMetrics.push({
                        metric: metricId,
                        scope: scopeWithDefault,
                        parameters: ofElement.with[metricId],
                        evidences: ofElement.evidences,
                        window: ofElement.window,
                        period: {
                            from: '*',
                            to: '*'
                        }
                    });
                }
            }

            var guaranteesValues = [];

            var timedScopes = [];
            var metricValues = [];

            logger.guarantees('Obtaining required metrics states for scoped guarantee ' + guarantee.id + '...');
            Promise.each(processMetrics, function(metricParam) {
                return manager.get('metrics', metricParam).then(function(scopedMetricValues) {
                    if (scopedMetricValues.length > 0) {
                        logger.guarantees('Timed scoped metric values for ' + scopedMetricValues[0].metric + ' has been calculated (' + scopedMetricValues.length + ') ');
                        logger.guarantees('Updating timed scope array for ' + scopedMetricValues[0].metric + '...');
                        scopedMetricValues.forEach(function(metricValue) {
                            var ts = {
                                scope: metricValue.scope,
                                period: metricValue.period
                            }

                            var tsIndex = timedScopes.indexOf(ts);

                            if (tsIndex == -1) {
                                tsIndex = timedScopes.push(ts) - 1;
                            } else {
                                logger.debug('####################################################################################');
                            }
                            if (metricValues[tsIndex] == null)
                                metricValues[tsIndex] = {};

                            metricValues[tsIndex][metricValue.metric] = manager.current(metricValue);
                        });

                        logger.guarantees('Timed scope array updated for ' + scopedMetricValues[0].metric);
                        logger.debug('Timed scope: ' + JSON.stringify(timedScopes, null, 2));
                        logger.debug('Metric value: ' + JSON.stringify(metricValues, null, 2));
                    } else {
                        logger.guarantees('No metrics found for parameters: ' + JSON.stringify(metricParam, null, 2));
                    }
                }).catch(function(err) {
                    logger.error('Error processing metric: ', err);
                    return reject(err);
                });
            }).then(function(metricsValues) {
                var guaranteesValues = [];
                logger.guarantees('Calculating penalties for scoped guarantee ' + guarantee.id + '...');
                for (var index = 0; index < timedScopes.length; index++) {
                    var guaranteeValue = calculatePenalty(agreement, guarantee.id, timedScopes[index], metricValues[index], slo, penalties);
                    guaranteesValues.push(guaranteeValue);
                }
                logger.guarantees('All penalties for scoped guarantee ' + guarantee.id + ' calculated.');
                logger.debug('Guarantees values: ' + JSON.stringify(guaranteesValues, null, 2));
                return resolve(guaranteesValues);
            }).catch(function(err) {
                logger.error(err);
                return reject(err);
            });
        });
    } catch (err) {
        logger.error(err);
    }
}

function calculatePenalty(agreement, guaranteeId, timedScope, metricsValues, slo, penalties) {

    var guaranteeValue = {};
    guaranteeValue.scope = timedScope.scope;
    guaranteeValue.period = timedScope.period;
    guaranteeValue.guarantee = guaranteeId;
    guaranteeValue.evidences = [];
    guaranteeValue.metrics = {};

    for (var metricId in metricsValues) {
        vm.runInThisContext(metricId + " = " + metricsValues[metricId].value);
        guaranteeValue.metrics[metricId] = metricsValues[metricId].value;
        guaranteeValue.evidences = guaranteeValue.evidences.concat(metricsValues[metricId].evidences);
    }
    var fulfilled = Boolean(vm.runInThisContext(slo));
    guaranteeValue.value = fulfilled;

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