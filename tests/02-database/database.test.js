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
var expect = require("chai").expect;
//var config = require('../../src/config');
var database = require('../../src/database');
//var connection;

describe('Connection Methods Tests', function() {
    this.timeout(200);

    it('Connection method', function(done) {

        database.connect(function(err) {
            if (!err) {
                expect(true);
                done();
            } else {
                expect(false);
                done();
            }

        });

    });

    it('Setup AgreementModel ', function(done) {
        /* jshint ignore:start */
        expect(database.models.AgreementModel).to.exist;
        /* jshint ignore:end */
        done();

    });

    it('Setup StateModel', function(done) {
        /* jshint ignore:start */
        expect(database.models.StateModel).to.exist;
        /* jshint ignore:end */
        done();
    });

    it('Disconnection method', function(done) {

        database.close(function(err) {
            if (!err) {
                expect(true);
                done();
            } else {
                expect(false);
                done();
            }
        });

    });


});
