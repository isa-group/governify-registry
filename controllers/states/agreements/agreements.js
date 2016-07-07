'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('governify-agreement-manager').operations.states;

var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.logger;

module.exports = {
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE,
    guaranteesGET: require('../guarantees/guarantees.js').guaranteesGET,
    guaranteeIdGET: require('../guarantees/guarantees.js').guaranteeIdGET
};

function _agreementIdGET(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.info("New request to GET agreements (states/agreements/agreements.js)");
    var agreementId = args.agreement.value;
    var from = args.from.value;
    var to = args.to.value;

    stateManager({
        id: agreeementId
    }).then(function(manager) {
        manager.get("agreement").then(function(agreement) {
            res.json(agreement);
        }, function(err) {
            logger.error(err.message.toString());
            res.status(err.code).json(err);
        });
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
    //         calculators.agreementCalculator.process(agreement, from, to)
    //             .then(function(agreementState) {
    //                 res.json(agreementState);
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


function _agreementIdDELETE(args, res, next) {
    logger.info("New request to DELETE agreement state");
    var agreementId = args.agreement.value;
    if (agreementId) {
        var StateModel = config.db.models.StateModel;
        StateModel.findOneAndRemove({
            agreementId: agreementId
        }, function(err) {
            if (!err) {
                res.sendStatus(200);
                logger.info("Deleted state for agreement " + agreementId);
            } else {
                res.sendStatus(404);
                logger.warning("Can't delete state for agreement " + agreementId + " :" + err);;
            }
        });
    } else {
        res.sendStatus(400);
        logger.warning("Can't delete state for agreement " + agreementId);
    }
}