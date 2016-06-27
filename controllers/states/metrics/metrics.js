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
