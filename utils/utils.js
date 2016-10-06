'use strict';

var diff = require("deep-diff");

module.exports.swagger = require('./swagger.js');
module.exports.middlewares = require('./middlewares.js');

module.exports.containsObject = function (obj, array) {
    var i;

    for (i = 0; i < array.length; i++) {
        if (diff(array[i], obj) == null) {
            return i;
        }
    }

    return -1;
}

module.exports.periods = {
    "secondly": 1000,
    "minutely": 60000,
    "hourly": 3600000,
    "daily": 86400000,
    "weekly": 604800000,
    "monthly": 2628000000,
    "quarterly": 7884000000,
    "yearly": 31540000000
}


module.exports.convertPeriod = function (billingCycle) {
    switch (billingCycle) {
    case "yearly":
        return "years";
    case "monthly":
        return "months";
    case "daily":
        return "days";
    }
}
