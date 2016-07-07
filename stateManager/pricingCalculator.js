'use strict';

var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var config = require('../config');
var utils = require('../utils/utils.js');
var logger = config.logger;

module.exports = {
    process: processPricing
}

function processPricing(agreement, query, manager) {
    logger.pricing("Preparing Promise to calculate pricing states");
    return new Promise((resolve, reject) => {

        var agreement = manager.agreement;
        var processGuarantees = [];

        var pricingPenaltiesDef = agreement.terms.pricing.billing.penalties;

        var classifiers = [];
        var penalties = [];

        if(config.parallelProcess.guarantees){
            agreement.terms.guarantees.forEach(function(guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

            Promise.all(processGuarantees).then(function(guaranteesStates) {

                guaranteesStates.forEach(function(guaranteeStates) {

                    logger.pricing("guaranteeStates: " + JSON.stringify(guaranteeStates, null, 2));

                    pricingPenaltiesDef.forEach((penalty) => {

                        var penaltyId = Object.keys(penalty.over)[0];
                        var groupBy = Object.keys(penalty.groupBy);
                        logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggegatedBy=" + penalty.aggegatedBy + ", groupBy= " + groupBy.toString() + "]");
                        var value = null;


                        for (var i = 0; i < guaranteeStates.length; i++) {
                            var guaranteeState = manager.current(guaranteeStates[i]);


                            logger.info("Processing guaranteeState " + i + " node: " + guaranteeState.scope.node);
                            var classifier = {};
                            classifier.scope = {};
                            classifier.period = guaranteeState.period;
                            classifier.penalty = penaltyId;

                            groupBy.forEach(function(group) {
                                classifier.scope[group] = guaranteeState.scope[group];
                            });

                            var cIndex = utils.containsObject(classifier, classifiers);


                            if (cIndex == -1) {
                                cIndex = classifiers.push(classifier) - 1;


                                penalties[cIndex] = {
                                    "scope": classifier.scope,
                                    "period": classifier.period,
                                    "value": 0,
                                    "penalty": classifier.penalty
                                }


                            }
                            if (guaranteeState.penalties) {
                                penalties[cIndex].value += guaranteeState.penalties[penaltyId]
                            }

                        }

                        logger.pricing("penalties: " + JSON.stringify(penalties, null, 2));

                    });

                });

                return resolve(penalties);

            }, function(err) {
                logger.error(err);
                res.status(500).json(new errorModel(500, err));
            });

        }else {
          var guaranteesStates = [];
          Promise.each(agreement.terms.guarantees, (guarantee) => {
                logger.pricing("Getting state for guarantee = " + guarantee.id);
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then((results) => {
                    results.forEach((element) => {
                        guaranteesStates.push(element);
                    });
                }, (err) => {
                    logger.pricing("Has ocurred an error getting guarantee = " + guarantee.id + ": " + err.toString());
                    return reject(err);
                });
            }).then((results) => {

                logger.pricing("guaranteesStates: " + JSON.stringify(guaranteesStates, null, 2));

                var pricingPenaltiesDef = agreement.terms.pricing.billing.penalties;

                var classifiers = [];
                var penalties = []

                pricingPenaltiesDef.forEach((penalty) => {

                    var penaltyId = Object.keys(penalty.over)[0];
                    var groupBy = Object.keys(penalty.groupBy);
                    logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggegatedBy=" + penalty.aggegatedBy + ", groupBy= " + groupBy.toString() + "]");
                    var value = null;


                    for (var i = 0; i < guaranteesStates.length; i++) {
                        var guaranteeState =  manager.current(guaranteesStates[i]);


                        logger.info("Processing guaranteeState " + i + " node: " + guaranteeState.scope.node);
                        var classifier = {};
                        classifier.scope = {};
                        classifier.period = guaranteeState.period;
                        classifier.penalty = penaltyId;

                        groupBy.forEach(function(group) {
                            classifier.scope[group] = guaranteeState.scope[group];
                        });

                        var cIndex = utils.containsObject(classifier, classifiers);


                        if (cIndex == -1) {
                            //logger.info("New classifier... ");
                            cIndex = classifiers.push(classifier) - 1;


                            penalties[cIndex] = {
                                "scope": classifier.scope,
                                "period": classifier.period,
                                "value": 0,
                                "penalty": classifier.penalty
                            }


                        }
                        if (guaranteeState.penalties) {
                            //logger.info("SUM " + guaranteeState.penalties[penaltyId] + " penalty to classifier:\n " + JSON.stringify(classifier));
                            penalties[cIndex].value += guaranteeState.penalties[penaltyId]
                        }

                    }

                    logger.pricing("penalties: " + JSON.stringify(penalties, null, 2));

                });

                return resolve(penalties);
            }, (err) => {
                logger.pricing(err.toString());
                return reject(err);
            });
        }
    });
}
