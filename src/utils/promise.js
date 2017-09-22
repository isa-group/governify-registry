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
var Promise = require('bluebird');
var config = require('../config');
var logger = config.logger;
var ErrorModel = require('../errors/index.js').errorModel;

var errors = require('./errors');
var controllerErrorHandler = errors.controllerErrorHandler;

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
    if (!result && !res) {
        //Promise mode
        result = [];

        return new Promise(function (resolve, reject) {
            Promise.settle(promisesArray).then(function (promisesResults) {
                try {
                    if (promisesResults.length > 0) {
                        for (var r in promisesResults) {
                            var onePromiseResults = promisesResults[r];
                            if (onePromiseResults.isFulfilled()) {
                                onePromiseResults.value().forEach(function (value) {
                                    if (manager) {
                                        result.push(manager.current(value));
                                    } else {
                                        result.push(value);
                                    }
                                });
                            }
                        }
                        resolve(result);
                    } else {
                        var err = 'Error processing Promises: empty result';
                        logger.error(err);
                        reject(err.toString());
                    }
                } catch (err) {
                    logger.error(err);
                    reject(err.toString());
                }
            }, function (err) {
                logger.error(err);
                reject(err.toString());
            });
        });
    } else {
        //Controller mode using streaming
        Promise.settle(promisesArray).then(function (promisesResults) {
            try {
                if (promisesResults.length > 0) {
                    for (var r in promisesResults) {
                        var onePromiseResults = promisesResults[r];
                        if (onePromiseResults.isFulfilled()) {
                            onePromiseResults.value().forEach(function (value) {
                                if (manager) {
                                    result.push(manager.current(value));
                                } else {
                                    result.push(value);
                                }
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
}


/**
 * Process mode.
 * @param {String} type Type of state to be required (e.g. 'metrics')
 * @param {StateManager} manager StateManager instance
 * @param {Array} queries array of queries to processing
 * @param {Object} result Array or stream with the result
 * @param {ResponseObject} res To respond the request
 * @param {Boolean} streaming Decide if stream or not stream response
 * @alias module:gUtils.processMode
 * */
function _processSequentialPromises(type, manager, queries, result, res, streaming) {


    if (!result && !res) {
        //Promise mode
        result = [];

        return new Promise(function (resolve, reject) {
            Promise.each(queries, function (query) {

                return manager.get(type, query).then(function (states) {
                    for (var i in states) {
                        var state = states[i];
                        result.push(manager.current(state));
                    }
                });
                //This catch will be controller by the each.catch in order to stop 
                //the execution when 1 promise fails

            }).then(function () {
                resolve(result);
            }).catch(function () {

                let errorString = "Error processing sequential promsies";
                return controllerErrorHandler(res, "promise", "_processSequentialPromises", 500, errorString, err);

            });
        });

    } else {
        //Controller mode using streaming
        Promise.each(queries, function (query) {

            return manager.get(type, query).then(function (states) {
                for (var i in states) {
                    var state = states[i];
                    //feeding stream
                    result.push(manager.current(state));
                }
            });
            //This catch will be controller by the each.catch in order to stop 
            //the execution when 1 promise fails

        }).then(function () {
            //end stream
            if (streaming) {
                result.push(null);
            } else {
                res.json(result);
            }
        }).catch(function (err) {

            let errorString = "Error processing sequential promsies in controllers";
            return controllerErrorHandler(res, "promise", "_processSequentialPromises", 500, errorString, err);

        });
    }

}