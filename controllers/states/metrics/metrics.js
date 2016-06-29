'use strict';

var agreementManager = require('governify-agreement-manager');
var metricsRecords = agreementManager.operations.states.recordsManager.metrics;
var errorModel = require('../../../errors/index.js').errorModel;

var config = require('../../../config');
var logger = config.state.logger;


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

    // var AgreementModel = config.db.models.AgreementModel;
    // AgreementModel.findOne({
    //     'id': agreementId
    // }, function(err, agreement) {
    //     if (err) {
    //         res.status(500).end(JSON.stringify({
    //             code: 500,
    //             message: err
    //         }));
    //     }
    //     if (agreement) {
    //         var processMetrics = [];
    //         var metricParams = {
    //             "scope": {
    //                 "priority": "3",
    //                 "node": "*",
    //                 "serviceLine": "1. Linea servicio de mantenimiento básico",
    //                 "activity": "1.1. Actividad de incidencias"
    //             },
    //             "window": {
    //                 "type": "static",
    //                 "period": "monthly",
    //                 "initial": "20160116",
    //                 "end": ""
    //             }
    //         }
    //         for (var metricId in agreement.terms.metrics) {
    //             processMetrics.push(calculators.metricCalculator.process(agreement, metricId, metricParams));
    //         }

    //         Promise.all(processMetrics).then(function(metricsValues) {
    //             res.json(metricValues);
    //         });
    //     } else {
    //         res.status(404).end(JSON.stringify({
    //             code: 404,
    //             message: 'Agreement ' + agreementId + ' cannot be found.'
    //         }));
    //     }
    // });
}

module.exports.metricsIdPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   * metric (String)
   **/
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var from = args.from.value;
    var to = args.to.value;
    var metricParams = args.scope.value;
    metricParams.id = metricId;

    stateManager({
        id: agreementId
    }).get("metrics", metricParams, function(metrics) {
        res.json(metrics);
    }, function(err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

    // var AgreementModel = config.db.models.AgreementModel;
    // AgreementModel.find({
    //     'id': agreementId
    // }, function(err, agreement) {
    //     if (err) {
    //         res.status(500).end(JSON.stringify({
    //             code: 500,
    //             message: err
    //         }));
    //     }

    //     var metricParams = {
    //         "scope": {
    //             "priority": "3",
    //             "node": "*",
    //             "serviceLine": "1. Linea servicio de mantenimiento básico",
    //             "activity": "1.1. Actividad de incidencias"
    //         },
    //         "window": {
    //             "type": "static",
    //             "period": "monthly",
    //             "initial": "20160116",
    //             "end": ""
    //         }
    //     }

    //     if (agreement.length === 1) {
    //         calculators.metricCalculator.process(agreement[0], metricId, metricParams).then(function(metricState) {
    //             if (metricState.metricValues) {
    //                 res.end(JSON.stringify(metricState.metricValues));
    //             }
    //         }, function(err) {
    //             console.log(err);
    //             res.status(500).end(JSON.stringify({
    //                 code: 500,
    //                 message: err
    //             }));
    //         });
    //     } else if (agreement.length === 0) {
    //         res.status(404).end(JSON.stringify({
    //             code: 404,
    //             message: 'Agreement ' + agreementId + ' cannot be found.'
    //         }));
    //     } else if (agreement.length > 1) {
    //         res.status(500).end(JSON.stringify({
    //             code: 500,
    //             message: 'Error while retrieving agreement ' + agreementId + ' from database.'
    //         }));
    //     }
    // });

}

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
    }).put("metrics", {
        id: metricName,
        value: metricValue
    }, function(metric) {
        res.json(metric);
    }, function(err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });


    // StateModel.findOne({
    //     "agreementId": agreementId
    // }, (err, state) => {
    //     if (err) {
    //         logger.error(err.toString());
    //         res.status(500).json(new errorModel(500, err.toString()));
    //     }

    //     if (state) {
    //         logger.info("Updating state... ");
    //         metricsRecords.save(state, metricName, metricValue.scope, metricValue.window, metricValue.value);

    //         StateModel.update({
    //             "agreementId": agreementId
    //         }, state, (err) => {
    //             if (err) res.status(500).json(new errorModel(500, err.toString()));
    //             logger.info("State updated");
    //             //RECALCULAR EL ESTADO DE LAS QUOTAS, RATES o GUARANTEES DESPUES DEL CAMBIO EN LA METRICA.
    //             res.json(new errorModel(200, "OK"));
    //         });

    //     } else {
    //         logger.info("Not Found any agreement with id = " + agreementId);
    //         res.status(404).json(new errorModel(404, "Not Found any agreement with id = " + agreementId));
    //     }

    // });
}