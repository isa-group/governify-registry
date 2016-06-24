'use strict';

var agreementManager = require('governify-agreement-manager');
var metricsRecords = agreementManager.operations.states.recordsManager.metrics;
var errorModel = require('../../../errors/index.js').errorModel;

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
     logger.info("New request to PUT metrics");
     var agreementId = args.agreement.value;
     var metricValue = args.metricValue.value;
     var metricName = args.metric.value;
     StateModel.findOne({"agreementId": agreementId}, (err, state) => {
          if(err) res.status(500).json(new errorModel(500, err.toString()));

          if(state){

              metricsRecords.save(state, metricName,metricValue.scope, metricValue.window, metricValue.value);

              StateModel.update({"agreementId": agreementId}, state, (err) => {
                if(err) res.status(500).json(new errorModel(500, err.toString()));
                res.json(new errorModel(200,"OK"));
              });

          }else{
              logger.info("Not Found any agreement with id = " + agreementId);
              res.status(404).json(new errorModel(404, "Not Found any agreement with id = " + agreementId));
          }

     });
}
