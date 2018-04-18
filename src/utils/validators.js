/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

governify-registry is an Open-source software available under the 
GNU General Public License (GPL) version 2 (GPL v2) for non-profit 
applications; for commercial licensing terms, please see README.md 
for any inquiry.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


'use strict';

var Ajv = require('ajv');

/**
 * Metrics module
 * @module metrics
 * @see module:validators
 * */
module.exports = {
    /**
     * Validate query for metrics
     * @param {Object} query query
     * @param {Object} metricId ID of the metric
     * @param {Object} metricDefinition Definition of the metric
     * @alias module:validators.metricQuery
     * */
    metricQuery: _metricQuery,
    /**
     * Validate query for guarantee
     * @param {Object} query query
     * @param {Object} guaranteeId ID of the guarantee
     * @param {Object} guaranteeDefinition Definition of the guarantee
     * @alias module:validators.metricQuery
     * */
    guaranteeQuery: _guaranteeQuery,
    /**
     * Validate query for guarantee
     * @param {Object} query query
     * @param {Object} guaranteeId ID of the guarantee
     * @param {Object} guaranteeDefinition Definition of the guarantee
     * @alias module:validators.metricQuery
     * */
    pricingQuery: _pricingQuery
};

function _pricingQuery(query) {
    var schema = require('../schemas/query-schema.json');


    var schemaValidationResults = schemaValidation(schema, query);
    var validation = true, errors = [];

    if (!schemaValidationResults.isValid) {
        validation = validation && false;
        errors = errors.concat(schemaValidationResults.errors.map((e) => { return e.message; }));
    }

    return {
        valid: validation,
        errors: errors
    };
}

function _metricQuery(query, metricId, metricDefinition) {
    var schema = require('../schemas/query-schema.json');

    //windows are required in metrics
    schema.required = ["scope", "window"];

    var schemaValidationResults = schemaValidation(schema, query);
    var validation = true, errors = [];

    //Parameters is not required add empty object if it is null.
    if (!query.parameters) { query.parameters = {}; }

    query.period = query.period ? query.period : {
        from: query.window ? query.window.initial : '*',
        to: query.window ? query.window.end : '*'
    };


    if (!schemaValidationResults.isValid) {
        validation = validation && false;
        errors = errors.concat(schemaValidationResults.errors.map((e) => { return e.message; }));
    }

    //Parameters are only needed if they are present in the metric definition
    var parametersCount = metricDefinition.parameters ? Object.keys(metricDefinition.parameters).length : 0;
    var inParametersCount = query.parameters ? Object.keys(query.parameters).length : 0;
    if ((parametersCount !== inParametersCount) && parametersCount !== 0) {
        validation = validation && false;
        errors.push('Metric ' + metricId + ' needs parameters: ' + Object.keys(metricDefinition.parameters || []).join(', '));
    }

    // ADD default values for scopes.
    var scopeDef = metricDefinition.scope;
    Object.keys(scopeDef || {}).forEach((s) => {
        if (!query.scope[s]) {
            query.scope[s] = scopeDef[s].default;
        }
    });

    query.metric = metricId;

    delete schema.required;

    return {
        valid: validation,
        errors: errors
    };
}

function _guaranteeQuery(query, guaranteeId /*, guaranteeDefinition*/) {
    var schema = require('../schemas/query-schema.json');

    var schemaValidationResults = schemaValidation(schema, query);
    var validation = true, errors = [];

    if (!schemaValidationResults.isValid) {
        validation = validation && false;
        errors = errors.concat(schemaValidationResults.errors.map((e) => { return e.message; }));
    }

    if (query.parameters) {
        validation = validation && false;
        errors.push('Parameters field is not permitted for guarantee queries.');
    }

    if (query.window) {
        validation = validation && false;
        errors.push('Window field is not permitted for guarantee queries.');
    }

    if (query.scope) {
        validation = validation && false;
        errors.push('Scope field is not permitted for guarantee queries.');
    }

    query.guarantee = guaranteeId;

    return {
        valid: validation,
        errors: errors
    };
}

function schemaValidation(schema, data) {
    var ajv = new Ajv();
    var querySchemaValidator = ajv.compile(schema);

    var valid = querySchemaValidator(data);
    // if (!valid) console.log(querySchemaValidator.errors);
    return {
        isValid: valid,
        errors: querySchemaValidator.errors
    };
}