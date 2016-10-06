'use strict';

var diff = require("deep-diff");

/**
 * Utils module.
 * @module utils
 * @requires deep-diff
 * */


module.exports = {
    /** 
     * Swagger module.
     * @see module:swagger
     * */
    swagger: require('./swagger.js'),
    /** 
     * middlewares module.
     * @see module:middlewares
     * */
    middlewares: require('./middlewares.js'),
    containsObject: _containsObject,
    periods: periods,
    convertPeriod: _convertPeriod
};


/** 
 * Check if an array contains a given object
 * @param {object} obj object to seach for
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


/** 
 * Periods in miliseconds
 * @alias module:utils.periods
 * */
var periods = {
    "secondly": 1000,
    "minutely": 60000,
    "hourly": 3600000,
    "daily": 86400000,
    "weekly": 604800000,
    "monthly": 2628000000,
    "quarterly": 7884000000,
    "yearly": 31540000000
};


/** 
 * Convert a given billing cycle into a period string
 * @param {object} billingCycle object billing cycle to convert
 * @alias module:utils.convertPeriod
 * */
function _convertPeriod(billingCycle) {
    switch (billingCycle) {
    case "yearly":
        return "years";
    case "monthly":
        return "months";
    case "daily":
        return "days";
    }
}