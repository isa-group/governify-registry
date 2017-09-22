/*!
governify-registry 3.0.0, built on: 2017-05-08
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var config = require('../../../../config');
var logger = config.logger;
var stateManager = require('../../../../stateManager/v4/state-manager.js'),
    utils = require('../../../../utils/utils');

var Error = utils.errors.Error;
var Query = utils.Query;

/**
 * Pricing state module.
 * @module pricing
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    PricingBillingPenaltiesGET: _PricingBillingPenaltiesGET
};


/**
 * GET pricing billing penalties.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:pricing.PricingBillingPenaltiesGET
 * */
function _PricingBillingPenaltiesGET(req, res) {
    var args = req.swagger.params;

    logger.warning(JSON.stringify(args));
    var agreementId = args.agreement.value;
    var query = new Query(req.query);
    logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        var validation = utils.validators.pricingQuery(query);
        if (!validation.valid) {
            logger.error("Query validation error");
            res.status(400).json(new Error(400, validation));
        } else {
            manager.get('pricing', query).then(function (data) {

                logger.ctlState("Sending Pricing-Billing-Penalties state");
                res.json(data);

            }, function (err) {
                logger.ctlState("ERROR: " + err.message);
                res.status(err.code).json(err);
            });
        }
    }, function (err) {
        logger.ctlState("ERROR: " + err.message);
        res.status(err.code).json(err);
    });
}