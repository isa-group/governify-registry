'use strict';

var agreementManager = require('governify-agreement-manager');
var metricsRecords = agreementManager.operations.states.recordsManager.metrics;
var errorModel = require('../../../errors/index.js').errorModel;

var calculators = require('../../../stateManager/calculators.js');
var Promise = require("bluebird");
var request = require('request');

var config = require('../../../config');
var logger = config.state.logger;



module.exports.metricsIdPUT = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * metric (String)
     * metricValue ()
     **/
     var StateModel = config.db.models.StateModel;
     var agreementId = args.agreement.value;
     var metricValue = args.metricValue.value;
     var metricName = args.metric.value;

     logger.info("New request to PUT metrics over: " + metricName + " with value: " + metricValue);
     StateModel.findOne({"agreementId": agreementId}, (err, state) => {
          if(err){
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err.toString()));
          }

          if(state){
              logger.info("Updating state... ");
              metricsRecords.save(state, metricName, metricValue.scope, metricValue.window, metricValue.value);

              StateModel.update({"agreementId": agreementId}, state, (err) => {
                if(err) res.status(500).json(new errorModel(500, err.toString()));
                logger.info("State updated");
                //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
                res.json(new errorModel(200,"OK"));
              });

          }else{
              logger.info("Not Found any agreement with id = " + agreementId);
              res.status(404).json(new errorModel(404, "Not Found any agreement with id = " + agreementId));
          }

     });
}

module.exports.metricsPOST =  function(req, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
   var args = req.swagger.params;
    var StateModel = config.db.models.StateModel;
    var agreementId = args.agreement.value;
    var AgreementModel = config.db.models.AgreementModel;
    logger.info("New request to GET metrics of agreement: " + agreementId);
    var processMetrics = [];
    var metricParams = args.scope.value;

    StateModel.findOne({"agreementId": agreementId}, (err, state) => {
        if(err){
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err.toString() ));
        }else{
            if(state){
                AgreementModel.findOne({'id': agreementId}, function(err, agreement) {
                    if(err){
                        logger.error(err.toString());
                        res.status(500).json(new errorModel(500, err.toString() ));
                    }
                    if(agreement){
                        // Mejorar y pasar a metricCalculator.
                        logger.info("Preparing requests to /states/" + agreementId + "/metrics/{metricId} : " );
                        for (var metricId in agreement.terms.metrics) {

                            if(agreement.terms.metrics[metricId].computer){
                                logger.info("==> metricId = " + metricId );
                                processMetrics.push(
                                    new Promise ((resolve,reject)=>{
                                      request.post({uri: 'http://'+ req.headers.host +'/api/v1/states/' + agreementId + '/metrics/' + metricId,
                                          json: true, body:metricParams
                                        },(err, responses, body)=>{
                                            if(err) reject(err);
                                            if(responses.statusCode == 200){
                                                resolve({
                                                    metricValues: body
                                                });
                                            }else{
                                                 reject("Error from metricsIdGET: " + body.message);
                                            }
                                      })
                                    })
                                );
                            }
                            //processMetrics.push(calculators.metricCalculator.process(agreement, metricId, metricParams));
                        }
                        logger.info("Waitting responses..." );
                        Promise.settle(processMetrics).then(function(results) {
                            //console.log(results);
                            var noError = true;
                            if(results.length > 0){
                                var metricsValues = [];
                                for( var r in results){
                                    if (results[r].isFulfilled()) {
                                        var values = results[r].value().metricValues;
                                        //console.log(values);
                                        for(var v in values){
                                            metricsValues.push(values[v]);
                                        }
                                    }else{
                                      noError = noError && false;
                                    }
                                }
                                /*if(noError)*/
                                  res.json(metricsValues);
                                /*else{
                                    logger.error("ERROR processing metrics");
                                    res.status(500).json(new errorModel(500,results[r]));
                                }*/
                            }else{
                                logger.error("ERROR processing metrics");
                                res.status(500).json(new errorModel(500, "ERROR processing metrics"));
                            }
                            //res.json(metricValues);
                        });

                    }else{
                        logger.info('Agreement ' + agreementId + ' cannot be found.');
                        res.status(404).json(new errorModel(404, 'Agreement ' + agreementId + ' cannot be found.'));
                    }

                });
            }else {
                logger.info('State ' + agreementId + ' cannot be found.');
                res.status(404).json(new errorModel(404, 'State ' + agreementId + ' cannot be found.'));
            }
        }
    });

}
var stateManager = require ('../../../stateManager/stateManager.js');

module.exports.metricsIdPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * metric (String)
   **/
    var StateModel = config.db.models.StateModel;
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var from = '';
    var to = '';
    if (args.from) {
      from = args.from.value;
    }
    if (args.to) {
      to = args.to.value;
    }
    var metricParams = args.scope.value;

    logger.info("New request to GET metric = " + metricId + " of agreement: " + agreementId);


    var AgreementModel = config.db.models.AgreementModel;
    AgreementModel.findOne({'id': agreementId}, function(err, agreement) {
       if (err) {
           logger.error(err.toString());
           res.status(500).json(new errorModel(500, err.toString() ));
       }
       stateManager(agreement, (manager)=>{
            manager.get('metrics', {
                metric: metricId,
                scope: metricParams.scope,
                window: metricParams.window
            }, (data) => {
                res.json(data);
            }, (err) => {
                logger.error(err.toString());
                res.status(500).json(new errorModel(500, err.toString() ));
            })
       }, (err)=>{
           logger.error(err.toString());
           res.status(500).json(new errorModel(500, err.toString() ));
       });
    });
      /**logger.info("Deciding if metric is Updated");
      isUpdated(state, agreement, metricId, metricParams, (isUpdated, logsState)=>{
           logger.info("==>" + metricId + " isUpdated = " + isUpdated);
           if(!isUpdated){
               logger.info("Updating metric...");
               if (agreement) {
                   calculators.metricCalculator.process(agreement, metricId, metricParams).then(function(metricState) {
                       if (metricState.metricValues) {
                         for(var mValue in metricState.metricValues ){
                              var value = metricState.metricValues[mValue];
                              metricsRecords.save(state, metricId, value.scope, {type: metricParams.window.type, period: metricParams.window.period}, value.value, logsState, value.evidences);

                         }
                          //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
                         StateModel.update({"agreementId": agreementId}, state, (err) => {
                             if(err) res.status(500).json(new errorModel(500, err.toString()));
                             logger.info("State updated");
                             res.json(state.metrics.filter((element, index, array) => {
                                   metricToCurrentValue(state, element.scope, element.window, element);
                                   if(!element.metric) return false;
                                   var ret = true;
                                   if(element.metric != metricId){
                                       ret = ret && false;
                                   }
                                   for (var s in metricParams.scope){
                                       if( element.scope[s] != metricParams.scope[s] && metricParams.scope[s] != "*" )
                                         ret = ret && false;
                                   }
                                   for (var w in metricParams.window){
                                       if(element.window[w] != metricParams.window[w] && w == "type" && w == "period")
                                         ret = ret && false;
                                   }
                                   return ret;
                             }));
                         });

                       }
                   }, function(err) {
                       logger.error(err.toString());
                       res.status(500).json(new errorModel(500, err.toString() ));
                   });
               } else{

                   logger.info('Agreement ' + agreementId + ' cannot be found.');
                   res.status(404).json(new errorModel(404, 'Agreement ' + agreementId + ' cannot be found.'));

               }

           }else{
               logger.info("==>Metric is already updated, returning metric");
               res.json(state.metrics.filter((element, index, array) => {
                   metricToCurrentValue(state, element.scope, element.window, element);
                   if(!element.metric) return false;
                   var ret = true;
                   if(element.metric != metricId){
                       ret = ret && false;
                   }
                   for (var s in metricParams.scope){
                       if( element.scope[s] != metricParams.scope[s] && metricParams.scope[s] != "*" )
                         ret = ret && false;
                   }
                   for (var w in metricParams.window){
                       if(element.window[w] != metricParams.window[w] && w == "type" && w == "period")
                         ret = ret && false;
                   }
                   return ret;
               }));
           }
       }, (err) => {
           logger.error(err.toString());
           res.status(500).json(new errorModel(500, err.toString() ));
       });
     });**/

}


module.exports.metricsIdHistoryPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * metric (String)
   **/
    var StateModel = config.db.models.StateModel;
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var from = '';
    var to = '';
    if (args.from) {
      from = args.from.value;
    }
    if (args.to) {
      to = args.to.value;
    }
    var metricParams = args.scope.value;

    logger.info("New request to GET history of metric = " + metricId + " of agreement: " + agreementId);

    StateModel.findOne({"agreementId": agreementId}, (err, state) => {
       if(err) {
           logger.error(err.toString());
           res.status(500).json(new errorModel(500, err.toString() ));
       }else{
           if(state){
             logger.info("Send history of metric = " + metricId + " of agreement: " + agreementId);
             res.json(state.metrics.filter((element, index, array) => {
                 if(!element.metric) return false;
                 var ret = true;
                 if(element.metric != metricId){
                     ret = ret && false;
                 }
                 for (var s in metricParams.scope){
                     if( element.scope[s] != metricParams.scope[s] && metricParams.scope[s] != "*" )
                       ret = ret && false;
                 }
                 for (var w in metricParams.window){
                     if(element.window[w] != metricParams.window[w] && w == "type" && w == "period")
                       ret = ret && false;
                 }
                 return ret;
             }));
           }else {
               logger.info('State ' + agreementId + ' cannot be found.');
               res.status(404).json(new errorModel(404, 'State ' + agreementId + ' cannot be found.'));
           }
       }
    });

}


function metricToCurrentValue(state, scope, window, metric){
    metric.value = metricsRecords.current(state, metric.metric, scope, window ).value;
    metric.evidences = metricsRecords.current(state, metric.metric, scope, window ).evidences;
    delete metric.records;
}
