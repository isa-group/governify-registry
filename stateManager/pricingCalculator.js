'use strict';

var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var config = require('../config');
var logger = config.logger;

module.exports = {
    process: processPricing
}

function processPricing(agreement, query, manager){
    logger.pricing("Preparing Promise to calculate pricing states" );
    return new Promise((resolve, reject)=>{

        var agreement = manager.agreement;

        var guaranteesSates = [];
        Promise.each(agreement.terms.guarantees, (guarantee)=>{
            logger.pricing("Getting state for guarantee = " + guarantee.id );
            return manager.get('guarantees', {
                guarantee: guarantee.id
            }).then((results) => {
                results.forEach((element)=>{
                    guaranteesSates.push(manager.current(element));
                });
            }, (err) => {
                logger.pricing("Has ocurred an error getting guarantee = " + guarantee.id + ": " + err.toString());
                return reject(err);
            });
        }).then((results)=>{
            var pricingPenaltiesDef = agreement.terms.pricing.billing.penalties;
            var newPricingState = {};

            pricingPenaltiesDef.forEach((penalty) => {
                var penaltyId = Object.keys(penalty.over)[0];
                var groupBy = Object.keys(penalty.groupBy);
                logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggegatedBy=" + penalty.aggegatedBy + ", groupBy= "+ groupBy.toString() +"]");
                var value = null;
                guaranteesSates.forEach((guaranteeState)=>{
                    switch (penalty.aggegatedBy) {
                        case "sum":
                            if(!value) value=0;
                            value += guaranteeState.penalties[penaltyId];
                            break;
                        default:
                            return reject("There are not method for aggegatedBy=" + penalty.aggegatedBy);
                    }
                });
            });

            return resolve(newPricingState);
        }, (err)=>{
            logger.pricing(err.toString());
            return reject(err);
        });

    });
}
