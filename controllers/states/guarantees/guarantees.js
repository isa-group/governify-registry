'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('governify-agreement-manager').operations.states;
var calculators = require('../../../calculators/calculators.js');

var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.state.logger;

module.exports = {
    guaranteesGET: _guaranteesGET,
    guaranteeIdGET: _guaranteeIdGET
}

function _guaranteesGET(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.info("New request to GET guarantees");
    var agreementId = args.agreement.value;
    var from = '';
    var to = '';
    if (args.from) {
        from = args.from.value;
    }
    if (args.to) {
        to = args.to.value;
    }

    var AgreementModel = config.db.models.AgreementModel;
    AgreementModel.find(function(err, agreements) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err));
        }

        if (agreements.length === 1) {
            calculators.guaranteeCalculator.processAll(agreements[0], from, to)
                .then(function(guarantees) {
                    res.json(guarantees);
                }, function(err) {
                    logger.error(err.toString());
                    res.status(500).json(new errorModel(500, err));
                });
        } else if (agreements.length === 0) {
            logger.error('Agreement ' + agreementId + ' not found.');
            res.status(404).json(new errorModel(404, 'Agreement ' +
                agreementId + ' not found.'));
        } else if (agreements.length > 1) {
            logger.error('Error while retrieving agreement ' +
                agreementId + ' from database: Two agreements with same ID found.');
            res.status(500).json(new errorModel(500, 'Error while retrieving agreement ' +
                agreementId + ' from database: Two agreements with same ID found.'));
        }
    });
}

function _guaranteeIdGET(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     * from (String)
     * to (String)
     **/
    logger.info("New request to GET guarantees");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;
    var from = '';
    var to = '';
    if (args.from) {
        from = args.from.value;
    }
    if (args.to) {
        to = args.to.value;
    }

    var AgreementModel = config.db.models.AgreementModel;
    AgreementModel.find(function(err, agreements) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err));
        }

        if (agreements.length === 1) {
            calculators.guaranteeCalculator.process(agreements[0], guaranteeId, from, to)
                .then(function(guarantee) {
                    res.json(guarantee);
                }, function(err) {
                    logger.error(err.toString());
                    res.status(500).json(new errorModel(500, err));
                });
        } else if (agreements.length === 0) {
            logger.error('Agreement ' + agreementId + ' not found.');
            res.status(404).json(new errorModel(404, 'Agreement ' +
                agreementId + ' not found.'));
        } else if (agreements.length > 1) {
            logger.error('Error while retrieving agreement ' +
                agreementId + ' from database: Two agreements with same ID found.');
            res.status(500).json(new errorModel(500, 'Error while retrieving agreement ' +
                agreementId + ' from database: Two agreements with same ID found.'));
        }
    });

}