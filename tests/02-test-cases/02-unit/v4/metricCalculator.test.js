/*!
governify-registry 3.0.1, built on: 2017-05-08
Copyright (C) 2017 ISA group
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

var __base = "../../../..";

var expect = require('chai').expect;
var $RefParser = require('json-schema-ref-parser');

// Names
var VERSION = "v4";
var BASE_FILENAME = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var METRIC_ID = "SPU_IO_K01";

// Used modules
var metricCalculator = require(__base + '/src/stateManager/' + VERSION + '/metricCalculator');

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + BASE_FILENAME + '.' + FILENAME_EXTENSION);
var metricParameters = require(__base + '/tests/required/metrics/' + VERSION + '/' + 'metricParameters.json');

// Expected files
var expectedMetricParameters = require(__base + '/tests/expected/metrics/' + VERSION + '/' + 'metricParameters.json');

describe("metricsCalculator unit tests v4...", function () {
    this.timeout(1000000);
    it('process metric', function (done) {
        $RefParser.dereference(agreementFile, function (err, schema) {
            if (err) {
                done(err);
            }
            console.log(schema);
            metricCalculator.process(schema, METRIC_ID, metricParameters).then(function (metricStates) {
                expect(metricStates).to.deep.equals(expectedMetricParameters);
                done();
            });
        });
    });
});