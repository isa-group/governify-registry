'use strict';

var Promise = require("bluebird");
var request = require('request');
const vm = require('vm');
var config = require('../config');
var utils = require('../utils/utils.js');
var logger = config.logger;
var errorModel = require('../errors/index.js').errorModel;
var utils = require('../utils/utils.js');
var moment = require('moment');
var clone = require('clone');

module.exports = {
    process: processQuotas
}


function processQuotas (stateManager, query){

    return new Promise((resolve, reject)=>{
        logger.quotas("Calculating quotas for query = " + JSON.stringify(query, null, 2));

        var agreement = stateManager.agreement;

        var quotaDef = null;
        for(var q in agreement.terms.quotas){
            var indexQuota = agreement.terms.quotas[q];
            if(indexQuota.id === query.quota){
                quotaDef = indexQuota
            }
        }
        if(!quotaDef){
            logger.error("Not found quota definition for id = %s", query.quota);
            return reject(new errorModel(404, "Not found quota definition for id = " + query.quota));
        }

        var queries = [];
        var overId = Object.keys(quotaDef.over)[0];
        var window = { type: "static" };
        var scopedQuotas = quotaDef.of;
        var index = 0;
        for(var o in scopedQuotas){
            var scopedQ = scopedQuotas[o];
            var queryScope = scopedQ.scope;
            for (var l in scopedQ.limits){
              window.period = scopedQ.limits[l].period;
              queries[index] = {
                  max: scopedQ.limits[l].max,
                  query: {
                    metric: overId, scope: queryScope,  window: window.period ? clone(window) : undefined
                  }
                };
              index ++;
            }
        }


        var initial =  moment().toISOString();
        Promise.each(Object.keys(queries), (index)=>{
            return stateManager.get('metrics', queries[index].query).then((data)=>{
                var sMQuery = queries[index].query;
                if(sMQuery.window){
                    if(!sMQuery.window.initial)
                        sMQuery.window.initial = initial;
                    var metricValue = data[0];
                    var value = 0;
                    for (var r in metricValue.records){
                        var record = metricValue.records[r];
                        if( r > 0 && record.time && utils.isInTime(record.time, sMQuery.window)){
                            value ++; //Modify the logic to accept quotas without periods.
                        }
                    }
                    metricValue = stateManager.current(data[0]);
                    metricValue.value = value;

                    delete sMQuery.window.initial;
                }else{
                    metricValue = stateManager.current(data[0]);
                }

                queries[index].metric = metricValue;
                if(metricValue.value < queries[index].max){
                    queries[index].value = true;
                }else{
                    queries[index].value = false;
                }
            }, (err)=>{
                logger.error("Error processing metric from quotas calculator = %s", JSON.stringify(queries[index].query, null, 2));
                return reject(new errorModel(404, "Error processing metric from quotas calculator = %s" + JSON.stringify(queries[index].query, null, 2)));
            });
        }).then((success) => {
            console.log(JSON.stringify(queries, null, 2));
            var response = [];
            for(var q in queries){
                var query = queries[q];
                var newQuota = new quota(quotaDef.id ,query);
                response.push(newQuota);
            }
            resolve(response);
        }, (err) => {
            logger.error("Error processing metrics from quotas calculator");
            return reject(new errorModel(404, "Error processing metrics from quotas calculator"));
        });

    });

}

function quota(quotaId, query){
    this.quota = quotaId;
    this.scope = query.query.scope;
    this.window = query.query.window;
    this.metrics = {};
    this.metrics[query.query.metric] =  query.metric.value;
    this.max = query.max;
    this.value = query.value;
}
