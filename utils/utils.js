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

var diff = require('deep-diff');
var moment = require('moment');
/**
 * Utils module.
 * @module utils
 * @requires deep-diff
 * @requires moment
 * */


module.exports = {
    /**
     * Swagger module.
     * @see module:utils.timeAndPeriod
     * */
    time: require('./timeAndPeriod.js'),
    /**
     * Swagger module.
     * @see module:utils.promise
     * */
    promise: require('./promise.js'),
    /**
     * Swagger module.
     * @see module:utils.stream
     * */
    stream: require('./stream.js'),
    /**
     * Swagger module.
     * @see module:utils.swagger
     * */
    swagger: require('./swagger.js'),
    /**
     * middlewares module.
     * @see module:utils.middlewares
     * */
    middlewares: require('./middlewares.js'),
    containsObject: _containsObject

};


/**
 * Check if an array contains a given object
 * @param {Object} obj object to seach for
 * @param {array} array array to search into
 * @alias module:utils.containsObject
 * */
function _containsObject(obj, array) {
    for (var i = 0; i < array.length; i++) {
        if (diff(array[i], obj) == null) {
            return i;
        }
    }
    return -1;
}
