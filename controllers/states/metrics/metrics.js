'use strict';

var agreementManager = require('governify-agreement-manager');
var metricsRecords = agreementManager.operations.states.recordsManager.metrics;
var errorModel = require('../../../errors/index.js').errorModel;

var config = require('../../../config');
var logger = config.state.logger;
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");
var request = require("request");

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

     stateManager({id: agreementId }, (manager) =>{
        manager.put('metrics', {  metric: metricName, scope: metricValue.scope, window: metricValue.window }, metricValue.value,
        (success)=>{
            res.json(success);
        }, (err) => {
            res.status(err.code).json(err);
        });
     }, (err) => {
        res.status(err.code).json(err);
     });
}

module.exports.metricsPOST =  function(req, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
   var args = req.swagger.params;
    var agreementId = args.agreement.value;
    var AgreementModel = config.db.models.AgreementModel;
    var processMetrics = [];
    var metricParams = args.scope.value;

    logger.info("New request to GET metrics of agreement: " + agreementId);

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

}

module.exports.metricsIdPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * metric (String)
   **/
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;

    var metricParams = args.scope.value;
    metricParams.id = metricId;

    stateManager({id: agreementId}, (manager)=>{
         manager.get('metrics', {
             metric: metricId,
             scope: metricParams.scope,
             window: metricParams.window,
             period: metricParams.period ? metricParams.period : {from: '*', to: '*'}
         }, (data) => {
             res.json(data.filter((element)=>{
                 manager.current(element);
                 return true;
             }));
         }, (err) => {
             logger.error(err);
             res.status(500).json(new errorModel(500, err ));
         });
    });

}

/**
.filter((element)=>{
    manager.current(element);
    return true;
})**/
