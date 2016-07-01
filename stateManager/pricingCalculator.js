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

function processPricing(agreement, query, manager){
    logger.pricing("Preparing Promise to calculate pricing states" );
    return new Promise((resolve, reject)=>{

        var agreement = manager.agreement;

        //var guaranteesSates = require('../guarantees.json');

        Promise.each(agreement.terms.guarantees, (guarantee)=>{
            logger.pricing("Getting state for guarantee = " + guarantee.id );
            return manager.get('guarantees', {
                guarantee: guarantee.id
            }).then((results) => {
                results.forEach((element)=>{
                    guaranteesSates.push(element);
                });
            }, (err) => {
                logger.pricing("Has ocurred an error getting guarantee = " + guarantee.id + ": " + err.toString());
                return reject(err);
            });
        }).then((guaranteesSates)=>{

            logger.pricing("guaranteesSates: "+JSON.stringify(guaranteesSates,null,2));

            var pricingPenaltiesDef = agreement.terms.pricing.billing.penalties;

            var classifiers = [];
            var penalties = []

            pricingPenaltiesDef.forEach((penalty) => {

                var penaltyId = Object.keys(penalty.over)[0];
                var groupBy = Object.keys(penalty.groupBy);
                logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggegatedBy=" + penalty.aggegatedBy + ", groupBy= "+ groupBy.toString() +"]");
                var value = null;


                for(var i=0; i<guaranteesSates.length; i++){
                    var guaranteeState = guaranteesSates[i];


                    logger.info("Processing guaranteeState "+i+" node: "+guaranteeState.scope.node);
                    var classifier = {};
                    classifier.scope = {};
                    classifier.period = guaranteeState.period;
                    classifier.penalty = penaltyId;

                    groupBy.forEach( function(group){
                      classifier.scope[group] = guaranteeState.scope[group];
                    });

                    var cIndex = utils.containsObject(classifier,classifiers);


                    if(cIndex == -1){
                      cIndex = classifiers.push(classifier) - 1;


                      penalties[cIndex] = {
                        "scope" : classifier.scope,
                        "period" : classifier.period,
                        "value" : 0,
                        "penalty" : classifier.penalty
                      }


                    }
                    if (guaranteeState.penalties) {
                      penalties[cIndex].value +=  guaranteeState.penalties[penaltyId]
                    }

                }

                logger.pricing("penalties: "+JSON.stringify(penalties,null,2));

            });

            return resolve(penalties);
        }, (err)=>{
            logger.pricing(err.toString());
            return reject(err);
        });

    });
}
