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

var calculators = require('./calculators.js')

module.exports = {
    process: _process
}

function _process(agreement, from, to) {
    return new Promise((resolve, reject) => {
        try {

            //Process metrics

            //for each metric processMetric
            var processMetrics = [];
            for (var metricId in agreement.terms.metrics) {
                processMetrics.push(calculators.metricCalculator.process(agreement, metricId))
            }

            // Process guarantees compensations
            var processGuarantees = [];
            agreement.terms.guarantees.forEach(function(guarantee) {
                processGuarantees.push(calculators.guaranteeCalculator.process(agreement, guarantee.id));
            });

            //Process quotas

            //Process rates


            // Execute all promises
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
        } catch (e) {
            console.error(e);
            return reject(e);
        }
    });
}