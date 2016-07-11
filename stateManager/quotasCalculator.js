'use strict';

var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var config = require('../config');
var utils = require('../utils/utils.js');
var logger = config.logger;
var errorModel = require('../errors/index.js').errorModel;

module.exports = {
    process: processQuotas
}


function processQuotas (stateManager, query){

    return new Promise((resolve, reject)=>{
        logger.quotas("Calculating quotas for query = " + JSON.stringify(query, null, 2));

        var agreement = stateManager.agreement;

        var quotaDef = null;
        for(var q in agreement.term.quotas){
            var indexQuota = agreement.term.quotas[q];
            if(indexQuota.id === query.quota){
                quotaDef = indexQuota
            }
        }
        if(!quotaDef){
            logger.error("Not found quota for id = %s", query.quotas);
            return reject(new errorModel(404, "Not found quota for id = %s", query.quotas));
        }

        var overId = Object.keys(quotaDef.over)[0];


    });

}
