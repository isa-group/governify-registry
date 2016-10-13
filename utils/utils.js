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
    convertPeriod: _convertPeriod,
    getPeriodsFrom: _getPeriodsFrom
};

/**
 * Check if an array contains a given object
 * @param {AgreementModel} agreement object to seach for
 * @param {WindowModel} window array to search into
 * @alias module:utils.getPeriodsFrom
 * */
function _getPeriodsFrom(agreement, window) {
    var periods = [];

    var Wfrom = moment.utc(moment.tz(window.initial, agreement.context.validity.timeZone));
    var Wto = window.end ? moment.utc(moment.tz(window.end, agreement.context.validity.timeZone)) : moment.utc();
    var from = moment.utc(Wfrom),
        to = moment.utc(Wfrom).add(1, "months").subtract(1, "milliseconds");

    while (!to || to.isSameOrBefore(Wto)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months"));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));
    }

    return periods;
}

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
 * @param {Object} billingCycle object billing cycle to convert
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
