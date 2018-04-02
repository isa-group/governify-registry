
var moment = require('moment');

var window = {
    type: "static",
    period: "minutely"
}


function isInTime(time, window){
    var periodToAdd = {secondly: "seconds", minutely: "minutes", hourly: "hours", daily: "days", weekly: "weeks", monthly: "months", yearly: "years"};
    var periodToSetNow = {secondly: "second", minutely: "minute", hourly: "hour", daily: "day", weekly: "week", monthly: "month", yearly: "year"};
    if(window.type == "static"){

        var now = moment(window.initial).startOf(periodToSetNow[window.period]);
        var end = moment(now).add(1, periodToAdd[window.period]);
        console.log({now: now.toISOString(), end: end.toISOString()});

        console.log(moment(time).isBetween(now, end));
        console.log(moment().toISOString());
        return moment(time).isBetween(now, end);

    }else if(window.type == "dynamic"){
        //TO DO 
    }
}


isInTime("2016-07-12T16:30:42.088Z", window);
