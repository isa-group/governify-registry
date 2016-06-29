'use strict';

var config = require('../config');
var logger = config.state.logger;
var request = require('request');
var errorModel = require('../errors/index.js').errorModel;
var iso8601 = require('iso8601');

module.exports = initialize;

function initialize(_agreement, successCb, errorCb){
    var StateModel = config.db.models.StateModel;
    var AgreementModel = config.db.models.AgreementModel;
    logger.info("Initializing stateManager with agreement ID = " + _agreement.id);
    logger.info("Searching agreement with agreementID = " + _agreement.id);
    AgreementModel.findOne({'id': _agreement.id}, function(err, ag) {
         if (err) {
             logger.error(err.toString());
             errorCb(new errorModel(500, err ));
         }else{
             logger.info("Searching state for agreementID = " + _agreement.id);
             StateModel.findOne({agreementId: _agreement.id}, (err, _state) => {
                 if(err) errorCb(new errorModel(500, err ));
                 else {
                     logger.info("stateManager for agreementID = " + _agreement.id + " initialized");
                     successCb({
                        agreement: ag,
                        state: _state,
                        get: _get,
                        put: _put,
                        refresh: _refresh
                     });
                 }
             });
         }
     });
}

function _get(stateType, query, successCb, errorCb ){
    logger.info("Getting " + stateType + " state for query =  " + JSON.stringify(query));
    logger.info("==>is updated?");
    isUpdated(this.state, this.agreement, stateType, query, (isUpdated, logsState)=>{
          logger.info("==>isUpdated = " + isUpdated);
          if(isUpdated){
              logger.info("==>Returning states");
              successCb(this.state[stateType].filter((element, index, array)=>{
                  return checkQuery(element, query);
              }));
          }else {
              logger.info("==>Refreshing states");
              this.put();
          }
    }, (err) => {
        logger.info("Error while checking if it is update " + stateType + " = " + JSON.stringify(query));
        errorCb(new errorModel(500, "Error while checking if it is update " + stateType + " = " + JSON.stringify(query)));
    });

}


function _put(stateType, query, value, successCb, errorCb, logsState, evidences){
    var StateModel = config.db.models.StateModel;
    var elementStates = this.state[stateType].filter((element, index, array)=>{
        return checkQuery(element, query);
    });

    if(elementStates.length > 0 && elementStates.length <= 1){
      elementStates[0].records.push(new record(value, logsState, evidences));
      StateModel.update({"agreementId": this.agreement.id}, this.state, (err) => {
        if(err) errorCb(new errorModel(500, err));
        else{
          logger.info("State updated");
          //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
          successCb(new errorModel(200,"OK"));
        }
      });
    }else if ( elementStates.length > 1){
      //error
      logger.info("Error");
      errorCb(new errorModel(400, "Is not possible to updating state with this query"));
    }else{
      logger.info("Crear");
      //crear
       this.state[stateType].push(new state(value, query, logsState, evidences));
       StateModel.update({"agreementId": this.agreement.id}, this.state, (err) => {
         if(err) errorCb(new errorModel(500, err));
         else{
           logger.info("State updated");
           //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
           successCb(new errorModel(200,"OK"));
         }
       });
    }

}

function state (value, query, logsState, evidences){
    for(var v in query){
        this[v] = query[v];
    }
    this.records = [];
    this.records.push(new record(value, logsState, evidences));
}

function record(value, logsState, evidences){
    this.value = value;
    this.time = iso8601.fromDate(new Date());
    if(logsState == 0 || logsState)
      this.logsState = logsState;
    if(evidences)
      this.evidences = evidences;
}


function isUpdated(state, agreement, stateType, query, successCb, errorCb){
    //var logsState = metricsRecords.current(state, mName, metricParams.scope, metricParams.window).logsState;
    var logUris = null;
    for( var log in agreement.context.definitions.logs){
        if(agreement.context.definitions.logs[log].default) logUris = agreement.context.definitions.logs[log].stateUri;
    }

    var elementStates = state[stateType].filter((element, index, array)=>{
        return checkQuery(element, query);
    });

    var current = null
    if(elementStates.length > 0)
       current = getCurrent(elementStates);

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
            errorCb("Error with Logs state URI this: " + logUris + " is not correct");
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
          if(element[v] !== query[v] && query[v] != "*"){
              ret = ret && false;
          }
      }
    }
    return ret;
}

function getCurrent(state){
    return state.records[state.records.length -1];
}
