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
