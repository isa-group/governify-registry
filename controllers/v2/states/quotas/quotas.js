/*!
governify-registry 0.0.1, built on: 2017-01-30
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
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
var stateManager = require('../../../../stateManager/v1/stateManager.js');


/**
 * Quotas state module.
 * @module quotas
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    quotasGET: _quotasGET,
    quotasQuotaGET: _quotasIdGET
};


/**
 * Get all quotas.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:quotas.quotasGET
 * */
function _quotasGET(args, res, next) {
    logger.info("New request to GET quotas");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("quotas", function (quotas) {
        res.json(quotas);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}


/**
 * Get quotas by ID.
 * @param {Object} args {agreement: String, quota: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:quotas.quotasQuotaGET
 * */
function _quotasIdGET(args, res, next) {
    logger.info("New request to GET quota");
    var agreementId = args.agreement.value;
    var quotaId = args.quota.value;

    stateManager({
        id: agreementId
    }).get("quotas", {
        id: quotaId
    }, function (quota) {
        res.json(quota);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}
