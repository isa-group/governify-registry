'use strict';

var agreementManager = require('governify-agreement-manager');
var metricsRecords = agreementManager.operations.states.recordsManager.metrics;
var errorModel = require('../../../errors/index.js').errorModel;

var config = require('../../../config');
var logger = config.state.logger;
var stateManager = require('../../../stateManager/stateManager.js')



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

    // for each metric
    stateManager({
        id: agreementId
    }).get("metrics", function(metrics) {
        res.json(metrics);
    }, function(err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
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
             window: metricParams.window
         }, (data) => {
             res.json(data);
         }, (err) => {
             logger.error(err);
             res.status(500).json(new errorModel(500, err ));
         });
    });

}
