/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict"

var yaml = require('js-yaml');
var fs = require('fs');
var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var config = require('../config');
var logger = config.logger;

var calculators = require('./calculators.js');

module.exports = {
    process: _process
}

function _process(manager, components, from, to) {
    return new Promise((resolve, reject) => {
        try {

            //Process metrics
            processMetrics(manager, components).then(function(results) {

                // Process guarantees
                processGuarantees(manager, components).then(function(results) {
                    return resolve(results);
                }, function(err) {
                    return reject(err);
                });

            }, function(err) {
                return reject(err);
            });

        } catch (e) {
            logger.error(e);
            return reject(e);
        }


    });
}

function processMetrics(manager, components) {
    return new Promise(function(respolve, reject) {

        var metrics = [];
        if (components.metrics == 'all') {
            metrics = Object.keys(manager.agreement.terms.metrics);
        } else {
            for (var metricId in manager.agreement.terms.metrics) {
                if (components.metrics.split(',').indexOf(metricId) != -1) {
                    metrics.push(metricId);
                }
            }
        }

        if (config.parallelProcess.metrics) {
            logger.agreement("Processing metrics in parallel mode");
            var processMetrics = [];
            metrics.forEach(function(metricId) {
                var priorities = ['P1', 'P2', 'P3'];
                if (metricId == 'SPU_IO_K00') {
                    priorities = [''];
                }

                // FALTA CREAR METRIC PARAMETERS (prioridad, scope...)

                priorities.forEach(function(priority) {
                    processMetrics.push(manager.get('metrics', {
                        metric: metricId,
                        scope: {
                            priority: priority,
                            NODO: '*',
                            CENTRO: '*'
                        },
                        window: {
                            type: 'static',
                            period: 'monthly',
                            initial: agreement.context.validity.initial,
                            timeZone: agreement.context.validity.timeZone
                        },
                        period: {
                            from: '*',
                            to: '*'
                        }
                    }));
                })
            });

            Promise.settle(processMetrics).then(function(results) {
                if (results.length > 0) {
                    var values = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].isFulfilled()) {
                            if (results[i].value().length > 0) {
                                results[i].value().forEach(function(metricValue) {
                                    values.push(metricValue);
                                });
                            }
                        }
                    }
                    return resolve(values);
                } else {
                    return reject('Error processing metric: empty result');
                }
            }, function(err) {
                console.error(err);
                return reject(err);
            });
        } else {
            logger.agreement("Processing metrics in sequential mode");
            logger.agreement("- guarantees: " + components.guarantees);
            logger.agreement("- metrics: " + components.metrics);
            Promise.each(metrics, (metricId) => {
                logger.agreement("- metricId: " + metricId);
                return manager.get('metrics', {
                    metric: metricId,
                    scope: scopeWithDefault,
                    window: window,
                    period: {
                        from: '*',
                        to: '*'
                    }
                }).then((results) => {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, (err) => {
                    logger.error(err);
                    return reject(err);
                });
            }).then(function(results) {
                return resolve(ret);
            }, (err) => {
                logger.error("Error processing metrics: ", err);
                return reject(err);
            });
        }
    });
}


function processGuarantees(manager, components) {
    return new Promise(function(resolve, reject) {

        var guarantees = [];
        if (components.guarantees == 'all') {
            guarantees = manager.agreement.terms.guarantees;
        } else {
            guarantees = manager.agreement.terms.guarantees.filter(function(guarantee) {
                return components.guarantees.indexOf(guarantee.id) != -1;
            });
        }

        if (config.parallelProcess.guarantees) {
            logger.agreement("Processing guarantees in parallel mode");
            var processGuarantees = [];
            guarantees.forEach(function(guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
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
                    return reject('Error processing compensations: empty result');
                }
            }, function(err) {
                console.error(err);
                return reject(err);
            });
        } else {
            logger.agreement("Processing guarantees in sequential mode");
            var ret = [];

            Promise.each(guarantees, (guarantee) => {
                logger.agreement("- guaranteeId: " + guarantee.id);
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then((results) => {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, (err) => {
                    logger.error(err);
                    return reject(err);
                });
            }).then(function(results) {
                return resolve(ret);
            }, (err) => {
                logger.error("Error processing guarantees: ", err);
                return reject(err);
            });
        }
    });
}