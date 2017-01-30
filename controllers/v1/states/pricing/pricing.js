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
var iso8601 = require('iso8601');
var Promise = require("bluebird");
var errorModel = require('../../../../errors/index.js').errorModel;
var stateManager = require('../../../../stateManager/v1/stateManager.js')
var Promise = require("bluebird");
var request = require("request");

module.exports.PricingBillingPenaltiesPOST = function (req, res, next) {
    var args = req.swagger.params;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

    stateManager({
        id: agreementId
    }).then((manager) => {
        manager.get('pricing', query).then((data) => {

            logger.ctlState("Sending Pricing-Billing-Penalties state");
            res.json(data);

        }, (err) => {
            logger.ctlState("ERROR: " + err.message);
            res.status(err.code).json(err);
        })
    }, (err) => {
        logger.ctlState("ERROR: " + err.message);
        res.status(err.code).json(err);
    });
}
