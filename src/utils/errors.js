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
 * @param {String} level The level where the error has occurred
 * @param {String} functionName The name of the function where the error has occurred
 * @param {Number} code Status Code
 * @param {String} message Error message
 * @param {Error} error 
 */
function promiseErrorHandler(reject, level, functionName, code, message, root) {
    //Call to the generic error handler
    var newError = ErrorHandler(level, functionName, code, message, root);
    //If progressive trace is true print the progressive trace.
    if (config.errors.progressiveTrace) {
        logger.error(newError.stackTrace());
    } else { // else print the message of the current error.
        logger.error(newError.toString());
    }
    //Reject the promise
    reject(newError);
}

/**
 * Funtion for handling error in controllers.
 * @param {Funtion} res Express response object given in controller
 * @param {String} level The level where the error has occurred
 * @param {String} functionName The name of the function where the error has occurred
 * @param {Number} code Status Code
 * @param {String} message Error message
 * @param {Error} error 
 */
function controllerErrorHandler(res, level, functionName, code, message, root) {
    //Call to the generic error handler
    var newError = ErrorHandler(level, functionName, code, message, root);
    //Print the progressive trace of the error
    logger.error(newError.stackTrace());
    //Send the response to the client.
    res.status(code).json(new ErrorModel(newError.code, newError.stackTrace()));
}

/**
 * Funtion for handling error.
 * @param {String} level The level where the error has occurred
 * @param {String} functionName The name of the function where the error has occurred
 * @param {Number} code Status Code
 * @param {String} message Error message
 * @param {Error} error 
 */
function ErrorHandler(level, functionName, code, message, root) {
    //Get the line of code, where the error has occurred.
    var regexp = /\(.+\)|at\s+.+\d$/;
    var stack = new Error().stack.split('\n')[3];
    var at = regexp.exec(stack);

    //Build error message
    var msg = "[" + level + "][" + functionName + "] - " + message + " " + at;

    //Return the error model
    return new ErrorModel(code, msg, root);
}

/** 
 * @class Error model
 * */
class ErrorModel {

    constructor(code, message, root) {
        this.code = code; //Code that identifies the error
        this.message = message; //The error message
        if (root) {
            this.root = root; //Root cause of the error
        }
    }

    //Print the progressive trace of the error
    stackTrace() {
        var msg = this.message;
        if (this.root && this.root instanceof ErrorModel) {
            msg += " --> FROM: " + this.root.stackTrace();
        } else if (this.root) {
            msg += " --> FROM: " + this.root.toString();
        }
        return msg;
    }

    //Print the message of the error
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
    ErrorHandler: ErrorHandler,
    promiseErrorHandler: promiseErrorHandler,
    controllerErrorHandler: controllerErrorHandler,
};