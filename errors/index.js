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
 * @param {string} code error code
 * @param {string} message error message
 * @alias module:error.errorModel
 * */
function _Error(code, message) {
    this.code = code;
    this.message = message;
}