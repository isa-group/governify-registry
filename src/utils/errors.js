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
var config = require('../config');
var logger = config.logger;


/**
 * Funtion for handling error in promises.
 * @param {Funtion} reject The reject callback of the promise
 * @param {Number} code Status Code
 * @param {String} message Error message
 * @param {Error} error 
 */
function promiseErrorHandler(reject, level, functionName, code, message, error) {
    var stack = new Error().stack;

    var caller = stack.split('\n')[2].trim();
    console.log(caller);

    var msg = "[" + level + "][" + functionName + "] - " + message;
    if (config.errors.trace) {
        msg += "\n" + error.toString();
    }

    logger.error(msg);
    reject(new Error(code, msg));
}

/** 
 * @class Error model
 * */
class ErrorModel {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }

    toString() {
        return this.message;
    }
}


/**
 * Errors module.
 * @module errors
 * */
module.exports = {
    Error: ErrorModel,
    promiseErrorHandler: promiseErrorHandler
};