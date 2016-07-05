'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('../../../stateManager/stateManager.js')
var Promise = require("bluebird");
var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.logger;

module.exports.guaranteesGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then((manager) => {
        logger.ctlState("Getting state of guarantees...");

        if (config.async.guarantees) {
            logger.ctlState("Processing guarantees in async mode");
            var processGuarantees = [];
            manager.agreement.terms.guarantees.forEach(function(guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

            Promise.all(processGuarantees).then(function(guaranteesValues) {
                var result = [];
                try {
                    guaranteesValues.forEach(function(guaranteeValues) {
                        var res = guaranteeValues.map(function(guaranteeValue) {
                            return manager.current(guaranteeValue);
                        });
                        result = result.concat(res);
                    });
                    res.json(result);
                } catch (err) {
                    logger.error(err);
                    res.status(500).json(new errorModel(500, err));
                }
            }, function(err) {
                logger.error(err);
                res.status(500).json(new errorModel(500, err));
            });
        } else {
            logger.ctlState("Processing guarantees in sync mode");
            var ret = [];
            Promise.each(manager.agreement.terms.guarantees, (guarantee) => {
                logger.ctlState("- guaranteeId: " + guarantee.id);
                // var guaranteeParams = args.scope.value;
                // guaranteeParams.period = guaranteeParams.period ? guaranteeParams.period : {
                //     from: '*',
                //     to: '*'
                // };
                // guaranteeParams.guarantee = guarantee.id;
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then((results) => {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, (err) => {
                    logger.error(err);
                });
            }).then(function(results) {
                res.json(ret);
            }, (err) => {
                logger.error("ERROR processing guarantees: ", err);
                res.status(500).json(new errorModel(500, err));
            });
        }
    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
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
    }).then((manager) => {
        manager.get('guarantees', {
            guarantee: guaranteeId
        }).then(function(success) {
            res.json(success.map((element) => {
                return manager.current(element);
            }));
        }, function(err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });
    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}