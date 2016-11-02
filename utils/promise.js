'use strict';
var Promise = require('bluebird');
var config = require('../config');
var logger = config.logger;
var errorModel = require('../errors/index.js').errorModel;

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
                res.status(500).json(new errorModel(500, err));
            }
        } catch (err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        }
    }, function (err) {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });

}

/**
 * Process mode.
 * @param {StateManager} manager StateManager instance
 * @param {Array} promisesArray array of primises to processing
 * @param {Object} result Array or stream with the result
 * @param {ResponseObject} res To respond the request
 * @param {Boolean} streaming Decide if stream or not stream response
 * @alias module:gUtils.processMode
 * */
function _processSequentialPromises(manager, promisesArray, result, res, streaming) {

    Promise.each(promisesArray, function (onePromiseResults) {
        for (var i in onePromiseResults) {
            var state = onePromiseResults[i];
            //feeding stream
            result.push(manager.current(state));
        }
    }).then(function (promisesInfo) {
        //end stream
        if (streaming)
            result.push(null);
        else
            res.json(result);

    }, function (err) {
        logger.error("ERROR processing guarantees: ", err);
        res.status(500).json(new errorModel(500, err));
    });

}
