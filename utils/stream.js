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
