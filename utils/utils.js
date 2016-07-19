'use strict';

var diff = require("deep-diff");
var moment = require('moment');

module.exports.containsObject = function(obj, array) {
    var i;

    for (i = 0; i < array.length; i++) {
        if (diff(array[i],obj) == null) {
            return i;
        }
    }

    return -1;
}

/**
* This function decides if @time is in the current @window time.
* @time : Date to check.
* @window : window to generate the interval of time.
**/
module.exports.isInTime = function(time, window){
    var periodToAdd = {secondly: "seconds", minutely: "minutes", hourly: "hours", daily: "days", weekly: "weeks", monthly: "months", yearly: "years"};
    var periodToSetNow = {secondly: "second", minutely: "minute", hourly: "hour", daily: "day", weekly: "week", monthly: "month", yearly: "year"};
    if(window.type == "static"){

        var now = moment(window.initial).startOf(periodToSetNow[window.period]);
        var end = moment(now).add(1, periodToAdd[window.period]);

        return moment(time).isBetween(now, end);

    }else if(window.type == "dynamic"){

        var now = moment(window.initial);
        var init = moment(now).subtract(1, periodToAdd[window.period]);

        return moment(time).isBetween(init, now);
    }
}
