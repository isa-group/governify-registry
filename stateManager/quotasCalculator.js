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
            for(var v in queryScope){
                if(queryScope[v] == "*" && query.scope[v]) queryScope[v] = query.scope[v];
            }
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
        var isData = false;
        Promise.each(Object.keys(queries), (index)=>{
            return stateManager.get('metrics', queries[index].query).then((data)=>{
                if(data.length > 0){
                    var values = [];
                    for(var m in data){
                        var valueScoped = {};
                        var sMQuery = queries[index].query;
                        if(sMQuery.window){
                            if(!sMQuery.window.initial)
                                sMQuery.window.initial = initial;
                            var metricValue = data[m];
                            var value = 0;
                            for (var r in metricValue.records){
                                var record = metricValue.records[r];
                                if( r > 0 && record.time && utils.isInTime(record.time, sMQuery.window)){
                                    value ++;
                                }
                            }
                            metricValue = stateManager.current(data[m]);
                            metricValue.value = value;

                            delete sMQuery.window.initial;
                        }else{
                            metricValue = stateManager.current(data[m]);
                        }

                        valueScoped.metric = metricValue;
                        if(metricValue.value < queries[index].max){
                            valueScoped.value = true;
                        }else{
                            valueScoped.value = false;
                        }
                        queries[index].isData = true;

                        values.push(valueScoped);
                    }
                    queries[index].values = values;
                }else {
                    queries[index].isData = false;
                }

            }, (err)=>{
                logger.error("Error processing metric from quotas calculator = %s " + err.toString(),  JSON.stringify(queries[index].query, null, 2));
                return reject(new errorModel(404, "Error processing metric from quotas calculator = %s" + JSON.stringify(queries[index].query, null, 2)));
            });
        }).then((success) => {
            console.log(JSON.stringify(queries, null, 2));
            var response = [];
            for(var q in queries){
                if(queries[q].isData){
                    var query = queries[q];
                    for (var val in query.values){
                        var scopedValue = query.values[val];
                        var newQuota = new quota( quotaDef.id, scopedValue, query );
                        response.push(newQuota);
                    }
                }
            }
            resolve(response);
        }, (err) => {
            logger.error("Error processing metrics from quotas calculator " + err.toString());
            return reject(new errorModel(404, "Error processing metrics from quotas calculator"));
        });

    });

}

function quota(quotaId, scopedValue, query){
    this.quota = quotaId;
    this.scope = scopedValue.metric.scope;
    this.window = query.query.window;
    this.metrics = {};
    this.metrics[query.query.metric] =  scopedValue.metric.value;
    this.max = query.max;
    this.value = scopedValue.value;
}
