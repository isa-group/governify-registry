'use strict';

/**
 * Errors module.
 * @module errors
 * */
module.exports = {
    errorModel: _Error
};


/** 
 * Error model for error response.
 * @param {String} code error code
 * @param {String} message error message
 * @alias module:errors.errorModel
 * */
function _Error(code, message) {
    this.code = code;
    this.message = message;
}