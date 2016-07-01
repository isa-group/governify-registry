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

    stateManager({
        id: agreementId
    }).then((manager) => {
        manager.put('metrics', { metric: metricName, scope: metricValue.scope, window: metricValue.window}, metricValue.value).then((success) => {
                res.json(success);
            }, (err) => {
                res.status(err.code).json(err);
            });
    }, (err) => {
        res.status(err.code).json(err);
    });
}

module.exports.metricsPOST = function(req, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    var args = req.swagger.params;
    var agreementId = args.agreement.value;
    var AgreementModel = config.db.models.AgreementModel;

    logger.info("New request to GET metrics of agreement: " + agreementId);

    stateManager({
        id: agreementId
    }).then((manager) => {
          logger.info("Preparing requests to /states/" + agreementId + "/metrics/{metricId} : ");
          var ret= [];
          Promise.each(Object.keys(manager.agreement.terms.metrics), (metricId)=>{
              logger.info("==> metricId = " + metricId);
              var metricParams = args.scope.value;
              metricParams.period = metricParams.period ? metricParams.period : {
                  from: '*',
                  to: '*'
              };
              metricParams.metric = metricId;
              return manager.get('metrics', metricParams).then((results)=>{
                  for(var i in results){
                      manager.current(results[i]);
                      ret.push(results[i]);
                  }
              }, (err)=>{
                  logger.error(err);
              });
          }).then(function(results) {
              res.json(ret);
          }, (err)=>{
              logger.error("ERROR processing metrics");
              res.status(500).json(new errorModel(500, err));
          });

    }, (err) => {
      logger.error("ERROR processing metrics");
      res.status(500).json(new errorModel(500, err));
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
    metricParams.metric = metricId;
    metricParams.period = metricParams.period ? metricParams.period : {
        from: '*',
        to: '*'
    };

    stateManager({
        id: agreementId
    }).then((manager) => {
        manager.get('metrics', metricParams).then((data) => {
            res.json(data.filter((element) => {
                manager.current(element);
                return true;
            }));
        }, (err) => {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });
    }, (err) => {
      logger.error(err);
      res.status(500).json(new errorModel(500, err));
    });
}
