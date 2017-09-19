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
        let logs;
        if (args['logs.id']) {
            logs = {};
            logs[args['logs.id']] = {};
        }

        if (scope) { this.scope = scope; }
        if (parameters) { this.parameters = parameters; }
        if (window) { this.window = window; }
        if (period) { this.period = period; }
        if (logs) { this.logs = logs; }
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

        if (name.length !== 2) {
            throw new Error('The name of query field is not valid: ' + e);
        }

        if (e.indexOf(filter) !== -1 && name[0] == filter) {
            name = name[1];
            queryObject[name] = args[e];
        }
    });

    return Object.keys(queryObject).length > 0 ? queryObject : null;
}