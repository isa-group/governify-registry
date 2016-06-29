'use strict';

var config = require('../config');
var logger = config.state.logger;
var request = require('request');
var errorModel = require('../errors/index.js').errorModel;
var iso8601 = require('iso8601');
var calculators = require('../stateManager/calculators.js');
var Promise = require("bluebird");

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
                        update: _update,
                        current: _current
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
              this.update(stateType, query, successCb, errorCb, logsState);
          }
    }, (err) => {
        logger.info(JSON.stringify(err));
        errorCb(new errorModel(500, "Error while checking if it is update: " + err));
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
          logger.info("==>" + stateType + " updated with query = " + JSON.stringify(query));
          //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
          successCb( this.state[stateType].filter((element, index, array)=>{
              return checkQuery(element, query);
          }));
        }
      });
    }else if ( elementStates.length > 1){

      logger.info("Error, Is not possible to updating state with this query = " + JSON.stringify(query));
      errorCb(new errorModel(400, "Is not possible to updating state with this query"));

    }else{
       this.state[stateType].push(new state(value, query, logsState, evidences));
       StateModel.update({"agreementId": this.agreement.id}, this.state, (err) => {
         if(err) errorCb(new errorModel(500, err));
         else{
           logger.info("==>Created new entry with query = " + JSON.stringify(query));
           //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
           successCb( this.state[stateType].filter((element, index, array)=>{
               return checkQuery(element, query);
           }));
         }
       });
    }

}

function _update(stateType, query, successCb, errorCb, logsState){
    var from = '?';
    var to = '?';
    var stateManager = this;
    switch (stateType) {
        case "agreement":
            calculators.agreementCalculator.process(this.agreement)
                .then(function(agreementState) {
                    this.put(stateType, agreementState, successCb, errorCb);
                }, function(err) {
                    logger.error(err.toString());
                    errorCb(new errorModel(500, err));
                });
            break;
        case "guarantees":
            calculators.guaranteeCalculator.process(this.agreement, query.guarantee)
                .then(function(guarantees) {
                    var processguarantees = [];
                    for(var g in guarantees){
                        processguarantees.push(new Promise((resolve, reject) => {
                              stateManager.put(stateType, {
                                guarantee: query.guarantee,
                                scope: guarantees[g].scope
                              },guarantees[g].value, resolve, reject, logsState );
                        }));
                    }
                    Promise.all(processguarantees).then((guarantees)=>{
                      var result = [];
                      for (var a in guarantees){
                          result.push(guarantees[a][0]);
                      }
                      successCb(result);
                    })
                }, function(err) {
                    logger.error(err.toString());
                    errorCb(new errorModel(500, err));
                });
            break;
        case "metrics":
            logger.info("==>Getting metrics from compunter URI");
            calculators.metricCalculator.process(this.agreement, query.metric, query)
                .then(function(metricState) {
                    var processMetrics = [];
                    for(var m in metricState.metricValues){
                        processMetrics.push(new Promise((resolve, reject) => {
                              stateManager.put(stateType, {
                                metric: query.metric,
                                scope:  metricState.metricValues[m].scope,
                                period: metricState.metricValues[m].period,
                                window: query.window
                              }, metricState.metricValues[m].value, resolve, reject, logsState, metricState.metricValues[m].evidences );
                        }));
                    }
                    Promise.all(processMetrics).then((metrics)=>{
                        var result = [];
                        for (var a in metrics){
                            result.push(metrics[a][0]);
                        }
                        successCb(result);
                    })
                }, function(err) {
                    logger.error(err.toString());
                    errorCb(new errorModel(500, err));
                });
            break;
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

    this.value= value;
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
       current = getCurrent(elementStates[0]);

    request.get({uri: logUris, json: true}, (err, response, body) =>{
        if(!err && response.statusCode == 200 && body){
            console.log("logState =>" + body);
            if(current){
                if(current.logsState){
                    if(current.logsState == body) successCb(true, body);
                    else successCb(false, body);
                }else{
                    successCb(true, body);
                }
            }else{
                successCb(false, body);
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
      if(query[v] instanceof Object && v != "parameters" ){
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

function _current(state){
    state.value = state.records[state.records.length -1].value;
    delete state.records;
}
