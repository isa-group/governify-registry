'use strict';

var config = require('../../../config');
var logger = config.state.logger;

module.exports = initialize;

function initialize(_agreement, successCb, errorCb){
    var StateModel = config.db.models.StateModel;
    logger.info("Initializing stateManager with agreement ID = " + agreement.id);

    StateModel.findOne({agreementId: agreement.id}, (err, _state)=>{
        if(err) errorCb(err);
        else {
            successCb({
               agreement: _agreement
               state: _state,
               get: _get,
               put: _put,
               refresh: _refresh
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
              this.save();
          }
    }, (err) => {
        logger.info("Error while checking if it is update " + stateType + " = " + query.id);
        errorCb(err);
    });

}

function _save(stateType, query, successCb, errorCb){
    logger.info("Saved!");
}



function isUpdated(state, agreement, stateType, query, successCb, errorCb){
    //var logsState = metricsRecords.current(state, mName, metricParams.scope, metricParams.window).logsState;
    var logUris = null;
    for( var log in agreement.context.definitions.logs){
        if(agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].uri;
    }

    logUris += "/count";

    var state = this.state[stateType].filter((element, index, array)=>{
        return checkQuery(element, query);
    }));

    var current = getCurrent(state);

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
    var ret = true;
    for(var v in query){
      if(element[v] !== query[v] && query[v] == "*" )
        ret = ret && false;
    }
    return ret;
}

function getCurrent(state){
    return state.records[state.length -1];
}
