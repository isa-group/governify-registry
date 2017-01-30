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

var config = require('../config');


/**
 * Swagger module.
 * @module utils.middlewares
 * @see module:utils
 * @requires config
 * */
module.exports = {
    stateInProgress: _stateInProgress
};


/**
 * Middleware to control when an agreement state process is already in progress
 * @param {RequestObject} req Object that contains all information of the request
 * @param {ResponseObject} res Object that contains all information of the response
 * @param {Function} next The next fuction for the chain
 * @alias module:middlewares.stateInProgress
 * */
function _stateInProgress(req, res, next) {
    config.logger.info('New request to retrieve state for agreement %s', JSON.stringify(req.params.agreement, null, 2));
    if (config.state.agreementsInProgress.indexOf(req.params.agreement) != -1) {
        config.logger.info('Agreement %s status: In-Progress. Ignoring request...', req.params.agreement);
        res.json(new errorModel(202, "Agreement %s status: In-Progress. Try again when the agreement calculation has finished", req.params.agreement));
    } else {
        if (config.statusBouncer) {
            config.state.agreementsInProgress.push(req.params.agreement);
            config.logger.info('Agreement status has been changed to: In-Progress');
        }

        res.on('finish', function () {
            if (config.statusBouncer) {
                config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(req.params.agreement), 1);
                config.logger.info('Agreement status has been changed to: Idle');
            }
        });
        next();
    }
}
