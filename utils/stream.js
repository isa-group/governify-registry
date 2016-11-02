'use strict';

var stream = require('stream');
var config = require('../config');
var logger = config.logger;

/**
 * Utils module.
 * @module utils.stream
 * @requires stream
 * @requires config
 * */

module.exports = {

    createReadable: _createReadable,

};

/**
 * Create new streamReadable
 * @param {Function} readFunction read function
 * @return {streamReadable} streamReadable streamReadable for pipe
 * @alias module:utils.stream.createReadable
 * */
function _createReadable(readFunction) {
    var streamReadable = new stream.Readable({

        objectMode: true

    }).on('error', function (err) {

        logger.streaming("Error while streaming: " + err.toString());

    }).on('data', function (data) {

        logger.streaming("Streaming data...");

    });

    if (!readFunction)
        streamReadable._read = function () {};
    else {
        streamReadable._read = readFunction;
    }

    return streamReadable;
}
