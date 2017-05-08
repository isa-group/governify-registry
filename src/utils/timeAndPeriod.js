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
};

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
