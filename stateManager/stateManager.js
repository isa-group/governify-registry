'use strict';

var config = require('../config');
var logger = config.state.logger;
var request = require('request');

module.exports = initialize;

function initialize(_agreement, successCb, errorCb){
    var StateModel = config.db.models.StateModel;
    logger.info("Initializing stateManager with agreement ID = " + _agreement.id);

    StateModel.findOne({agreementId: _agreement.id}, (err, _state) => {
        if(err) errorCb(err);
        else {
            successCb({
               agreement: _agreement,
               state: _state,
               get: _get,
               put: _put,
              // refresh: _refresh
            });
        }
    });

}

function _get(stateType, query, successCb, errorCb ){

    isUpdated(this.state, this.agreement, stateType, query, (isUpdated, logsState)=>{
          if(isUpdated){
              successCb(this.state[stateType].filter((element, index, array)=>{
                  return checkQuery(element, query);
              }));
          }else {
              this.put();
          }
    }, (err) => {
        logger.info("Error while checking if it is update " + stateType + " = " + query.id);
        errorCb(err);
    });

}

function _put(stateType, query, successCb, errorCb){
    logger.info("Saved!");
}



function isUpdated(state, agreement, stateType, query, successCb, errorCb){
    //var logsState = metricsRecords.current(state, mName, metricParams.scope, metricParams.window).logsState;
    var logUris = null;
    for( var log in agreement.context.definitions.logs){
        if(agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].uri;
    }

    logUris += "/count";

    var elementStates = state[stateType].filter((element, index, array)=>{
        return checkQuery(element, query);
    });

    var current = getCurrent(elementStates);

    request.get({uri: logUris, json: true}, (err, response, body) =>{
        if(!err && response.statusCode == 200){
            if(current){
                if(current.logsState){
                    //console.log(current.logsState + "=>" + body.count);
                    if(current.logsState == body.count) successCb(true, body.count);
                    else successCb(false, body.count);
                }else{
                    successCb(true, body.count);
                }
            }else{
                successCb(false, body.count);
            }
        }else{
            errorCb(err);
        }
    });
}

function checkQuery (element, query) {
    //console.log(element);
    var ret = true;
    for(var v in query){
      if(query[v] instanceof Object){
          ret = ret && checkQuery(element[v], query[v]);
      }else {
          console.log(element[v] + "=>" + query[v]);
          if(element[v] !== query[v] && query[v] != "*" )
            ret = ret && false;
      }
    }
    console.log("Decided: " + ret);
    return ret;
}

function getCurrent(state){
    return state.records[state.records.length -1];
}
