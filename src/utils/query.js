'use strict';

/**
 * @class Query
 * 
 */
module.exports = class Query {

    constructor(args) {
        // BUILD scope
        let scope = addComplexParameter(args, 'scope');

        // BUILD parameters
        let parameters = addComplexParameter(args, 'parameters');

        // BUILD window
        let window = addComplexParameter(args, 'window');

        // BUILD period
        let period = addComplexParameter(args, 'period');

        // BUILD period
        let log = addComplexParameter(args, 'log');

        if (scope) { this.scope = scope; }
        if (parameters) { this.parameters = parameters; }
        if (window) { this.window = window; }
        if (period) { this.period = period; }
        if (log) { this.log = log; }
    }

    static parseToQueryParams(object, raiz) {
        var string = "";
        //For each field in object
        for (var f in object) {
            var field = object[f];
            //Check if it is an Object, an Array or a literal value
            if (field instanceof Object && !(field instanceof Array)) {
                //If it is an object do recursive 
                string += this.parseToQueryParams(field, (raiz ? raiz + '.' : '') + f);
            } else if (field instanceof Array) {
                //If it is an array convert to a list of id
                string += f + '=' + field.map((e) => { return e.id; }).join(',');
                string += '&';
            } else {
                //If it is a literal convert to "name=value&" format
                string += (raiz ? raiz + '.' : '') + f + '=' + field + '&';
            }
        }
        return string;
    }
};

/**
 * @function Function transform from http request to query object
 * @param {Object} args Query of the http request before processing
 * @param {Object} queryObject Object for adding fields
 * @param {String} filter Name for filtering
 */
function addComplexParameter(args, filter) {
    var queryObject = {};
    Object.keys(args).forEach((e) => {
        let name = e.split('.');

        var auxQueryObject = {};
        if (e.indexOf(filter) !== -1 && name[0] == filter) {
            if (name.length > 2) {
                var fieldName = name[1];
                name.splice(0, 1);
                auxQueryObject[name.join('.')] = args[e];
                queryObject[fieldName] = addComplexParameter(auxQueryObject, name[0]);
            } else {
                name = name[1];
                queryObject[name] = args[e];
            }
        }
    });

    return Object.keys(queryObject).length > 0 ? queryObject : null;
}