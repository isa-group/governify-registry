'use strict';

var diff = require("deep-diff");

module.exports.containsObject = function(obj, array) {
    var i;

    for (i = 0; i < array.length; i++) {
        if (diff(array[i],obj) == null) {
            return i;
        }
    }

    return -1;
}

module.exports.periods = {
    "secondly": 1,
    "minutely": 60,
    "hourly": 3600,
    "daily": 86400,
    "weekly": 604800,
    "monthly": 2628000,
    "quarterly": 7884000,
    "yearly": 31540000
}


module.exports.convertPeriod = function(billingCycle) {
    switch (billingCycle) {
        case "yearly":
            return "years";
        case "monthly":
            return "months";
        case "daily":
            return "days";
    }
}
