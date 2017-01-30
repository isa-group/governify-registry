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
 * Pricing state module.
 * @module pricing
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    PricingBillingPenaltiesPOST: _PricingBillingPenaltiesPOST
};


/**
 * Post pricing billing penalties.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:pricing.PricingBillingPenaltiesPOST
 * */
function _PricingBillingPenaltiesPOST(req, res, next) {
    var args = req.swagger.params;

    logger.warning(JSON.stringify(args));
    var agreementId = args.agreement.value;
    var query = args.query.value;
    logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get('pricing', query).then(function (data) {

            logger.ctlState("Sending Pricing-Billing-Penalties state");
            res.json(data);

        }, function (err) {
            logger.ctlState("ERROR: " + err.message);
            res.status(err.code).json(err);
        });
    }, function (err) {
        logger.ctlState("ERROR: " + err.message);
        res.status(err.code).json(err);
    });
}
