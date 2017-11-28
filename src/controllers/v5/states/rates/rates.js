/*!
governify-registry 3.0.1, built on: 2017-05-08
Copyright (C) 2017 ISA group
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

var config = require('../../../../config');
var logger = config.logger;
var stateManager = require('../../../../stateManager/v5/state-manager.js');


/**
 * Rates state module.
 * @module rates
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    ratesGET: _ratesGET,
    ratesRateGET: _ratesIdGET
};


/**
 * Get all rates.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:rates.ratesGET
 * */
function _ratesGET(args, res) {
    logger.info("New request to GET rates");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("rates", function (rates) {
        res.json(rates);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}


/**
 * Get rates by ID.
 * @param {Object} args {agreement: String, rate: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:rates.ratesRateGET
 * */
function _ratesIdGET(args, res) {
    logger.info("New request to GET rate");
    var agreementId = args.agreement.value;
    var rateId = args.rate.value;

    stateManager({
        id: agreementId
    }).get("rates", {
        id: rateId
    }, function (rate) {
        res.json(rate);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}