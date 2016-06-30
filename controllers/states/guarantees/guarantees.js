'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('../../../stateManager/stateManager.js')
var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.state.logger;


module.exports.guaranteesGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.info("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("guarantees", function(guarantees) {
        res.json(guarantees);
    }, function(err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

    // var AgreementModel = config.db.models.AgreementModel;
    // AgreementModel.findOne(function(err, agreement) {
    //     if (err) {
    //         logger.error(err.toString());
    //         res.status(500).json(new errorModel(500, err));
    //     }

    //     if (agreement) {
    //         calculators.guaranteeCalculator.processAll(agreement, from, to)
    //             .then(function(guarantees) {
    //                 res.json(guarantees);
    //             }, function(err) {
    //                 logger.error(err.toString());
    //                 res.status(500).json(new errorModel(500, err));
    //             });
    //     } else {
    //         logger.error('Agreement ' + agreementId + ' not found.');
    //         res.status(404).json(new errorModel(404, 'Agreement ' +
    //             agreementId + ' not found.'));
    //     }
    // });
}

module.exports.guaranteeIdGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     **/
    logger.info("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;

    stateManager({
        id: agreementId
    }, (manager) => {
        manager.get('guarantees', {
                guarantee: guaranteeId
            },
            (success) => {
                res.json(success);
            }, (err) => {
                res.status(500).json(new errorModel(500, err));
            });
    }, (err) => {
        res.status(500).json(new errorModel(500, err));
    });
}