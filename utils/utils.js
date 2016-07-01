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
