'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var logger = config.logger;
var stateManager = require('../../../stateManager/stateManager.js');
var agreementManager = require('governify-agreement-manager').operations.states;
var Promise = require("bluebird");
var request = require('request');
var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var mailer = require('../../../mailer');
var calculators = require('../../../stateManager/calculators.js');
const util = require('util');

module.exports = {
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE,
    agreementIdRELOAD: _agreementIdRELOAD,
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
        id: agreementId
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

function _agreementIdRELOAD(args, res, next) {
    var agreementId = args.agreementId.value;
    var notify = args.notify.value;

    logger.ctlState("New request to reload state of agreement " + agreementId);

    var StateModel = config.db.models.StateModel;
    StateModel.findOneAndRemove({
        agreementId: agreementId
    }, function(err) {
        var errors = [];
        if (!err) {
            var message = 'Reloading state of agreement ' + agreementId + '. ' +
                (notify ? 'An email will be sent to ' + notify + ' when the process ends' : '');
            res.end(message);

            logger.ctlState("Deleted state for agreement " + agreementId);

            var AgreementModel = config.db.models.AgreementModel;
            AgreementModel.findOne({
                id: agreementId
            }, function(err, agreement) {
                if (err) {
                    logger.error(err.toString());
                    errors.push(err);
                }

                agreementManager.initializeState(agreement, (st) => {
                    var state = new config.db.models.StateModel(st);
                    state.save((err) => {
                        if (err) {
                            logger.error("Mongo error saving state: " + err.toString());
                            errors.push(err);
                        }

                        logger.ctlState("State initialized successfully!");

                        stateManager({
                            id: agreementId
                        }).then(function(manager) {
                            calculators.agreementCalculator.process(agreement, manager).then(function(result) {
                                if (errors.length > 0)
                                    logger.error("Agreement state reload has been finished with " + errors.length + " errors: \n" + JSON.stringify(errors));
                                else {
                                    logger.ctlState("Agreement state reload has been finished successfully");

                                    if (notify)
                                        sendMail(notify, agreement);
                                }
                            }, function(err) {
                                logger.error(err.message.toString());
                                errors.push(err);
                            });
                        }, function(err) {
                            logger.error(err.message.toString());
                            errors.push(err);
                        });
                    })
                });
            });
        } else {
            logger.error("Can't delete state for agreement " + agreementId + " :" + err);
            errors.push(err);
        }
    });
}

function sendMail(to, agreement) {
    logger.ctlState("Sending email to " + to);

    //var mailContent = util.format(config.email.messages.reloadAgreement.mailContent, agreement.id);
    var mailContent = util.format("State of SLA '%s' has been updated based on the log registered.<br/> Current log count is:<br/>", agreement.id);

    var logRequests = [];
    for (var logId in agreement.context.definitions.logs) {
        var log = agreement.context.definitions.logs[logId];
        log.id = logId;
        logRequests.push(log);
    }

    var logStates = [];
    Promise.each(logRequests, function(log) {
        return new Promise(function(resolve, reject) {
            request.get({
                uri: log.stateUri
            }, (err, response, body) => {
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
    }).then(function(results) {
        if (logStates.length > 0) {
            mailContent += '<ul>';
            logStates.forEach(function(logState) {
                mailContent += '<li>' + logState.id + ' (' + logState.state + ')</li>';
            });
            mailContent += '<ul/>';
        }

        var mailOptions = {
            from: '"ISA-Group" <no-reply@isa.us.es>',
            to: to,
            subject: '[Governify] SLA status has been updated',
            html: mailContent
        };

        mailer.sendMail(mailOptions, function(error, info) {
            if (error) {
                return logger.error(error);
            }
            logger.ctlState('Email to ' + to + ' has been sent');
        });
    });
}