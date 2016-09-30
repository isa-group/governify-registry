'use strict';

module.exports.errorModel = Error;

/**
 * Error model for error response.
 *
 * Examples:
 *
 *    return new Error(500, 'Internal server error')
 *
 * @param {Integer} code
 * @param {String} message
 *
 * @return {Error} Object
 * @api public
 */
function Error(code, message){
    this.code = code;
    this.message = message;
}
