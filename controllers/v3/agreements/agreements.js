'use strict';

var config = require('../../../config');
var logger = config.logger;
var db = require('../../../database');
var agreementState = require('../states/states').agreements;
var stateRegistySrv = require('../StateRegistryService');
var errorModel = require('../../../errors/index.js').errorModel;

var $RefParser = require('json-schema-ref-parser');
var agreementManager = require('governify-agreement-manager').operations.states;



/**
 * Registry agreement module.
 * @module agreements
 * @see module:AgreementRegistry
 * @see module:AgreementRegistryService
 * @requires config
 * @requires database
 * @requires states
 * @requires StateRegistryService
 * @requires errors
 * @requires json-schema-ref-parser
 * @requires governify-agreement-manager
 * */
module.exports = {
    agreementsPOST: _agreementsPOST,
    agreementsDELETE: _agreementsDELETE,
    agreementsGET: _agreementsGET,
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE,
    agreementsAgreementTermsGuaranteesGET: _agreementsAgreementTermsGuaranteesGET,
    agreementsAgreementTermsGuaranteesGuaranteeGET: _agreementsAgreementTermsGuaranteesGuaranteeGET
};


/**
 * Post an agreement
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsPOST
 * */
function _agreementsPOST(args, res, next) {
    logger.info("New request to CREATE agreement");
    $RefParser.dereference(args.agreement.value, function (err, schema) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err));
        } else {
            var agreement = new db.models.AgreementModel(schema);
            agreement.save(function (err) {
                if (err) {
                    logger.error("Mongo error saving agreement: " + err.toString());
                    res.status(500).json(new errorModel(500, err));
                } else {
                    logger.info('New agreement saved successfully!');
                    logger.info('Initializing agreement state');
                    //Initialize state
                    agreementManager.initializeState(schema, function (st) {
                        var state = new db.models.StateModel(st);
                        state.save(function (err) {
                            if (err) {
                                logger.error("Mongo error saving state: " + err.toString());
                                res.status(500).json(new errorModel(500, err));
                            } else {
                                logger.info("State initialized successfully!");
                                res.sendStatus(200);
                            }
                        });
                    }, function (err) {
                        logger.error("Mongo error saving state: " + err.toString());
                        res.status(500).json(new errorModel(500, err));
                    });
                }
            });
        }
    });
}


/**
 * Delete all agreements.
 * @param {Object} args {}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsDELETE
 * */
function _agreementsDELETE(args, res, next) {
    logger.info("New request to DELETE all agreements");
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.remove({}, function (err) {
        if (!err) {
            logger.info("Deleted all agreements");
            stateRegistySrv.statesDELETE(args, res, next);
        } else {
            res.sendStatus(404);
            logger.warning("Can't delete all agreements: " + err);
        }
    });
}


/**
 * Get all agreements.
 * @param {Object} args {}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsGET
 * */
function _agreementsGET(args, res, next) {
    /**
     * parameters expected in the args:
     * namespace (String)
     **/
    logger.info("New request to GET agreements agreements/agreements.js");
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find(function (err, agreements) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new errorModel(500, err));
        }
        logger.info("Agreements returned");
        res.status(200).json(agreements);
    });
}


/**
 * Get an agreement by agreement ID.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementIdGET
 * */
function _agreementIdGET(args, res, next) {
    logger.info("New request to GET agreement with id = " + args.agreement.value);
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.findOne({
        id: args.agreement.value
    }, function (err, agreement) {
        if (err) {
            logger.error(err.toString());
            return res.status(500).json(new errorModel(500, err));
        }

        if (!agreement) {
            logger.warning('There is no agreement with id: ' + args.agreement.value);
            return res.status(404).json(new errorModel(404, 'There is no agreement with id: ' + args.agreement.value));
        }

        logger.info("Agreement returned");
        res.status(200).json(agreement);
    });
}


/**
 * Delete an agreement by agreement ID.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementIdDELETE
 * */
function _agreementIdDELETE(args, res, next) {
    logger.info("New request to DELETE agreement");
    var agreementId = args.agreement.value;
    if (agreementId) {
        var AgreementModel = db.models.AgreementModel;
        AgreementModel.find({
            "id": agreementId
        }).remove(function (err) {
            if (!err) {
                logger.info("Deleted agreement with id " + agreementId);
                args.agreements = args.agreement;
                agreementState.agreementIdDELETE(args, res, next);
            } else {
                res.sendStatus(404);
                logger.warning("Can't delete agreement with id " + agreementId);
            }
        });
    } else {
        res.sendStatus(400);
        logger.warning("Can't delete agreement with id " + agreementId);
    }
}


/**
 * Get all agreement terms.
 * @param {Object} args {}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsAgreementTermsGuaranteesGET
 * */
function _agreementsAgreementTermsGuaranteesGET(args, res, next) {
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find({
        'id': args.agreement.value
    }, function (err, agreement) {
        if (err) {
            console.error(err);
            res.end();
        }
        if (agreement.length === 1) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(agreement[0].terms.guarantees));
        }
    });
}


/**
 * Get all agreement guarantees.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsAgreementTermsGuaranteesGuaranteeGET
 * */
function _agreementsAgreementTermsGuaranteesGuaranteeGET(args, res, next) {
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find({
        'id': args.agreement.value
    }, function (err, agreement) {
        if (err) {
            console.error(err);
            res.end();
        }
        if (agreement.length === 1) {
            var guarantee = agreement[0].terms.guarantees.filter(function (guarantee) {
                return guarantee.id === args.guarantee.value;
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(guarantee));
        }
    });
}
