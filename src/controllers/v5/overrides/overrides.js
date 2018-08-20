/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

governify-registry is an Open-source software available under the 
GNU General Public License (GPL) version 2 (GPL v2) for non-profit 
applications; for commercial licensing terms, please see README.md 
for any inquiry.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


'use strict';

const logger = require('../../../logger');
const $RefParser = require('json-schema-ref-parser');
const db = require('../../../database');
const request = require('request');

const states = require('../states/states');
const ErrorModel = require('../../../errors/index.js').errorModel;
const agreementManager = require('governify-agreement-manager').operations.states;
const config = require('../../../configurations')
const bills = require('../bills/bills');

/**
 * Registry override module.
 * @module overrides
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
    statesAgreementGuaranteesGuaranteeOverridesPOST: _statesAgreementGuaranteesGuaranteeOverridesPOST,
    statesAgreementGuaranteesGuaranteeOverridesDELETE: _statesAgreementGuaranteesGuaranteeOverridesDELETE,
    statesAgreementGuaranteesGuaranteeOverridesGET: _statesAgreementGuaranteesGuaranteeOverridesGET
};

/**
 * Post an agreement
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreement.agreementsPOST
 * */
function _statesAgreementGuaranteesGuaranteeOverridesPOST(args, res) {
    logger.info("New request to CREATE override");
    $RefParser.dereference(args.override.value, function (err, schema) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new ErrorModel(500, err));
        } else {
            var BillsModel = db.models.BillsModel;
            BillsModel.findOne({ 'agreementId': args.agreement.value, 'period.from': args.override.value.period.from }, function (err, bill) {
                if (err) {
                    logger.error(err.toString());
                    res.status(500).json(new ErrorModel(500, err));
                }
                else {
                    console.log(" BILL STATE: " + JSON.stringify(bill))
                    if (!bill || bill.state.toUpperCase() != "CLOSED") {

                        var OverridesModel = db.models.OverridesModel;
                        var overrides = new db.models.OverridesModel(schema);
                        OverridesModel.findOne({ 'agreement': args.agreement.value, 'guarantee': args.guarantee.value }, function (err, result) {
                            if (err) {
                                logger.error(err.toString());
                                res.status(500).json(new ErrorModel(500, err));
                            }
                            if (!result || result.length < 1) {

                                var newAgreementOverrides = new OverridesModel({ 'agreement': args.agreement.value, 'guarantee': args.guarantee.value, 'overrides': [args.override.value] });
                                newAgreementOverrides.save(function (err) {
                                    if (err) {
                                        logger.error("Mongo error saving agreement: " + err.toString());
                                        res.status(500).json(new ErrorModel(500, err));
                                    } else {
                                        logger.info('New override saved successfully!');
                                        logger.info('Initializing agreement state');
                                        //Initialize state
                                        var urlReload = "http://localhost:" + config.server.port + "/api/v5/states/" + args.agreement.value + "/guarantees?from=" + args.override.value.period.from + "&to= " + args.override.value.period.to + "&forceUpdate=true";
                                        var computerRequest = request.get({
                                            url: urlReload,
                                            //   qs: qs.parse(urlParams)
                                        }).on('response', function computerResponseHandler(httpResponse) {
                                            //Processing computer response
                                            //If HTTP status code is not equal 200 reject the promise and end the process
                                            var result;
                                            if (httpResponse.statusCode !== 200) {
                                                result = "Error in forceUpdate state " + httpResponse.statusCode + ':' + httpResponse.statusMessage;
                                            }
                                            else {
                                                result = httpResponse;
                                            }
                                            res.status(200).send(result);
                                            stateManager({
                                                id: args.agreement.value
                                            }).then(function (manager) {
                                                manager.get(args.agreement.value).then(function (agreement) {
                                                    request.post({
                                                        headers: {
                                                            'period':{
                                                            'from': args.override.value.period.from,
                                                            'to': args.override.value.period.to
                                                            }
                                                        }, url: "http://localhost:5000/api/v1/contracts/" + args.agreement.value + "/ctrl/start"
                                                    })
                                                }, function (err) {
                                                    logger.error(err.message.toString());

                                                });
                                            }, function (err) {
                                                logger.error(err.message.toString());
                                            });
                                        });
                                    }
                                });


                            }
                            else {
                                result.overrides.push(args.override.value);
                                OverridesModel.update({ 'agreement': args.agreement.value, 'guarantee': args.guarantee.value }, result, function (err) {
                                    if (err) {
                                        logger.error("Mongo error saving agreement: " + err.toString());
                                        res.status(500).json(new ErrorModel(500, err));
                                    } else {
                                        logger.info(' 2-New override saved successfully!');
                                        logger.info('Initializing agreement state');
                                        //Initialize state
                                        //TODO: Parametrize URL
                                        var urlReload = "http://localhost:8081/api/v5/states/" + args.agreement.value + "/guarantees?from=" + args.override.value.period.from + "&to=" + args.override.value.period.to + "&forceUpdate=true";
                                        logger.info("URLL: " + urlReload) //TODO: Remove
                                        var computerRequest = request.get({
                                            url: urlReload,
                                            //   qs: qs.parse(urlParams)
                                        }).on('end', function computerResponseHandler() {
                                            //Processing computer response
                                            //If HTTP status code is not equal 200 reject the promise and end the process


                                            res.status(200).send("OK");
                                            console.log(" -- Sending request to update influx31")
                                            //  console.log(JSON.stringify(postData));
                                            console.log(args.agreement.value);

                                            var requestData = {
                                                'period': {
                                                    'from': args.override.value.period.from,
                                                    'to': args.override.value.period.to,

                                                }
                                            }
                                            request({
                                                url: "http://localhost:5000/api/v1/contracts/" + args.agreement.value + "/ctrl/start",
                                                method: "POST",
                                                json: requestData
                                            }, function (error, response, body) {
                                                if (!error && response.statusCode == 200) {
                                                    console.log(body)
                                                }
                                            }
                                            );


                                        });
                                    }
                                });
                            }
                        });

                    }
                    else {
                        res.status(400).send("You cannot override periods when the bill is closed.");
                    }
                }
                });

          
        }
    });
}


/**
 * Delete override.
 * @param {Object} args {}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:override.overrideDELETE
 * */
function _statesAgreementGuaranteesGuaranteeOverridesDELETE(args, res) {
    logger.info("New request to DELETE override");
    $RefParser.dereference(args.override.value, function (err, schema) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new ErrorModel(500, err));
        } else {
            var OverridesModel = db.models.OverridesModel;
            var overrides = new db.models.OverridesModel(schema);
            OverridesModel.update({ 'agreement': args.agreement.value, 'guarantee': args.guarantee.value }, { $pull: { overrides: args.override.value }}, function (err, result) {
            if (err) {
                logger.error(err.toString());
                res.status(500).json(new ErrorModel(500, err));
                } else {
                    logger.info('New override deleted successfully!');
                    logger.info('Initializing agreement state');
                var urlReload = "http://localhost:8081/api/v5/states/" + args.agreement.value + "/guarantees?from=" + args.override.value.period.from + "&to=" + args.override.value.period.to + "&forceUpdate=true";
                var computerRequest = request.get({
                    url: urlReload,
                    //   qs: qs.parse(urlParams)
                }).on('end', function computerResponseHandler() {
                    //Processing computer response
                    //If HTTP status code is not equal 200 reject the promise and end the process


                    res.status(200).send("OK");


                });
                    //Initialize state
                }
                });
           

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
function _statesAgreementGuaranteesGuaranteeOverridesGET(args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     **/
    logger.info("New request to GET overrides overrides/overrides.js");
    var OverridesModel = db.models.OverridesModel;
    console.log(args.agreement.value + " - " + args.guarantee.value);
    OverridesModel.findOne({ 'agreement': args.agreement.value, 'guarantee': args.guarantee.value }, function (err, overrides) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new ErrorModel(500, err));
        }
        if (!overrides || overrides == ""){
            res.status(200).json([]);
        }else{
        console.log(JSON.stringify(overrides.overrides));
        logger.info("Overrides returned returned");
        res.status(200).json(overrides.overrides);
        }
    });
}



