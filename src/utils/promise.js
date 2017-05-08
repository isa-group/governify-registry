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
var Promise = require('bluebird');
var config = require('../config');
var logger = config.logger;
var ErrorModel = require('../errors/index.js').errorModel;

/**
 * Utils module.
 * @module utils.promisez
 * @requires stream
 * @requires config
 * @requires errors
 * */

module.exports = {
    processParallelPromises: _processParallelPromises,
    processSequentialPromises: _processSequentialPromises
};

/**
 * Process mode.
 * @param {StateManager} manager StateManager instance
 * @param {Array} promisesArray array of primises to processing
 * @param {Object} result Array or stream with the result
 * @param {ResponseObject} res To respond the request
 * @param {Boolean} streaming Decide if stream or not stream response
 * @alias module:gUtils.processMode
 * */
function _processParallelPromises(manager, promisesArray, result, res, streaming) {

    Promise.settle(promisesArray).then(function (promisesResults) {
        try {
            if (promisesResults.length > 0) {
                for (var r in promisesResults) {
                    var onePromiseResults = promisesResults[r];
                    if (onePromiseResults.isFulfilled()) {
                        onePromiseResults.value().forEach(function (value) {
                            result.push(manager.current(value));
                        });
                    }
                }
                if (streaming) {
                    result.push(null);
                } else {
                    res.json(result);
                }
            } else {
                var err = 'Error processing Promises: empty result';
                logger.error(err);
                res.status(500).json(new ErrorModel(500, err));
            }
        } catch (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        }
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });

}


function _processSequentialPromises(manager, queries, result, res, streaming) {

    Promise.each(queries, function (oneQueries) {

        return manager.get('guarantees', oneQueries).then(function (promiseResult) {
            for (var i in promiseResult) {
                var state = promiseResult[i];
                //feeding stream
                result.push(manager.current(state));
            }
        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });

    }).then(function () {
        //end stream
        if (streaming) {
            result.push(null);
        } else {
            res.json(result);
        }
    }, function (err) {
        logger.error("ERROR processing guarantees: ", err);
        res.status(500).json(new ErrorModel(500, err));
    });

}
