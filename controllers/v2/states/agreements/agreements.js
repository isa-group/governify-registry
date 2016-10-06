'use strict';

var config = require('../../../../config');
var db = require('../../../../database');
var logger = config.logger;
var stateManager = require('../../../../stateManager/stateManager.js');
var Promise = require("bluebird");
var request = require('request');
var mailer = require('../../../../mailer');
var calculators = require('../../../../stateManager/calculators.js');

/**
 * Agreement state module.
 * @module agreements
 * @see module:states
 * @requires config
 * @requires stateManager
 * @requires bluebird
 * @requires request
 * @requires mailer
 * @requires calculators
 * */
module.exports = {
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE,
    agreementIdRELOAD: _agreementIdRELOAD,
    guaranteesGET: require('../guarantees/guarantees.js').guaranteesGET,
    guaranteeIdGET: require('../guarantees/guarantees.js').guaranteeIdGET
};

/**
 * Get an agreement by ID
 * @param {object} args Object properties: agreement (String), from (String), to (String)
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:agreements.agreementIdGET
 * */
function _agreementIdGET(args, res, next) {
    logger.info("New request to GET agreements (states/agreements/agreements.js)");
    var agreementId = args.agreements.value;
    var from = args.from.value;
    var to = args.to.value;

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get("agreement").then(function (agreement) {
            res.json(agreement);
        }, function (err) {
            logger.error(err.message.toString());
            res.status(err.code).json(err);
        });
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}

/**
 * Delete an agreement by ID
 * @param {object} args Object properties: agreement (String), from (String), to (String)
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:agreements.agreementIdDELETE
 * */
function _agreementIdDELETE(args, res, next) {
    var agreementId = args.agreements.value;
    logger.info("New request to DELETE agreement state for agreement " + agreementId);
    if (agreementId) {
        var StateModel = db.models.StateModel;
        StateModel.find({
            "agreementId": agreementId
        }).remove(function (err) {
            if (!err) {
                res.sendStatus(200);
                logger.ctlState("Deleted state for agreement " + agreementId);
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

/**
 * Reload an agreement by ID
 * @param {object} args Object properties: agreement (String), from (String), to (String)
 * @param {object} res response
 * @param {object} next  next function
 * @alias module:agreements.agreementIdRELOAD
 * */
function _agreementIdRELOAD(args, res, next) {
    var agreementId = args.agreements.value;
    var parameters = args.parameters.value;

    logger.ctlState("New request to reload state of agreement " + agreementId);

    var StateModel = db.models.StateModel;
    StateModel.find({
        "agreementId": agreementId
    }).remove(function (err) {
        var errors = [];
        if (!err) {
            var message = 'Reloading state of agreement ' + agreementId + '. ' +
                (parameters.mail ? 'An email will be sent to ' + parameters.mail.to + ' when the process ends' : '');
            res.end(message);

            logger.ctlState("Deleted state for agreement " + agreementId);

            var AgreementModel = db.models.AgreementModel;
            AgreementModel.findOne({
                id: agreementId
            }, function (err, agreement) {
                if (err) {
                    logger.error(err.toString());
                    errors.push(err);
                }

                stateManager({
                    id: agreementId
                }).then(function (manager) {
                    logger.ctlState("Calculating agreement state...");
                    calculators.agreementCalculator.process(manager, parameters.requestedState).then(function (result) {
                        logger.debug("Agreement state has been calculated successfully");
                        if (errors.length > 0)
                            logger.error("Agreement state reload has been finished with " + errors.length + " errors: \n" + JSON.stringify(errors));
                        else {
                            logger.ctlState("Agreement state reload has been finished successfully");

                            if (parameters.mail)
                                sendMail(agreement, parameters.mail);
                        }
                    }, function (err) {
                        logger.error(err.message.toString());
                        errors.push(err);
                    });
                }, function (err) {
                    logger.error(err.message.toString());
                    errors.push(err);
                });
            });
        } else {
            logger.error("Can't delete state for agreement " + agreementId + " :" + err);
            errors.push(err);
        }
    });
}
/**
 * @function sendMail
 * @param {object} agreement agreement
 * @param {object} mail mail parameters
 * */
function sendMail(agreement, mail) {
    logger.ctlState("Sending email to " + mail.to);

    var logRequests = [];
    for (var logId in agreement.context.definitions.logs) {
        var log = agreement.context.definitions.logs[logId];
        log.id = logId;
        logRequests.push(log);
    }

    var logStates = [];
    Promise.each(logRequests, function (log) {
        return new Promise(function (resolve, reject) {
            request.get({
                uri: log.stateUri
            }, function (err, response, body) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                logStates.push({
                    id: log.id,
                    state: body
                });
                return resolve();
            });
        });
    }).then(function (results) {
        if (logStates.length > 0) {
            mail.content += '<ul>';
            logStates.forEach(function (logState) {
                mail.content += '<li>' + logState.id + ' (' + logState.state + ')</li>';
            });
            mail.content += '<ul/>';
        }

        var mailOptions = {
            from: mail.from,
            to: mail.to,
            subject: mail.subject,
            html: mail.content
        };

        mailer.sendMail(mailOptions, function (error, info) {
            if (error) {
                return logger.error(error);
            }
            logger.ctlState('Email to ' + mail.to + ' has been sent');
            logger.ctlState('Summer is coming');
        });
    });

}
