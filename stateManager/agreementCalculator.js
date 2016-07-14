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

function _process(manager, from, to) {
    return new Promise((resolve, reject) => {
        try {

            //Process metrics

            //Process quotas

            //Process rates

            // Process guarantees

            if (config.parallelProcess.guarantees) {
                logger.ctlState("Processing guarantees in parallel mode");
                var processGuarantees = [];
                manager.agreement.terms.guarantees.forEach(function(guarantee) {
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
                logger.ctlState("Processing guarantees in sequential mode");
                var ret = [];
                Promise.each(manager.agreement.terms.guarantees, (guarantee) => {
                    logger.ctlState("- guaranteeId: " + guarantee.id);
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

                    // Promise each por cada metrica de components (param)

                    if (manager.agreement.terms.metrics['SPU_IO_K00']) {
                        manager.get('metrics', {
                            metric: 'SPU_IO_K00'
                        }).then((results) => {
                            return resolve(ret);
                        }, (err) => {
                            logger.error(err);
                            return reject(err);
                        });
                    } else {
                        return resolve(ret);
                    }
                }, (err) => {
                    logger.error("Error processing guarantees: ", err);
                    return reject(err);
                });
            }
        } catch (e) {
            logger.error(e);
            return reject(e);
        }


    });
}