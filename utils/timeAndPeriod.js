'use strict';
var config = require('../config');
var logger = config.logger;
var moment = require('moment-timezone');

/**
 * Utils module.
 * @module utils.promisez
 * @requires config
 * */

module.exports = {
    getPeriods: _getPeriods,
    periods: periods,
    convertPeriod: _convertPeriod
};

/**
 * Check if an array contains a given object
 * @param {AgreementModel} agreement object to seach for
 * @param {WindowModel} window array to search into
 * @alias module:utils.getPeriodsFrom
 * */
function _getPeriods(agreement, window) {
    var periods = [];
    var slot = slots[window.period || "monthly"];

    var Wfrom = moment.utc(moment.tz(window.initial ? window.initial : agreement.context.validity.initial, agreement.context.validity.timeZone));
    var Wto = window.end ? moment.utc(moment.tz(window.end, agreement.context.validity.timeZone)) : moment.utc();

    var from = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone)),
        to = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone).add(slot.count, slot.unit).subtract(1, "milliseconds"));

    while (!to || to.isSameOrBefore(Wto)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(slot.count, slot.unit));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(slot.count, slot.unit).subtract(1, "milliseconds"));
    }

    return periods;
}

var slots = {
    "quarterly": {
        count: 3,
        unit: "months"
    },
    "monthly": {
        count: 1,
        unit: "months"
    }
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
