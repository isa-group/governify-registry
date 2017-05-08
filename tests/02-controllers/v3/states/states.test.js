/*!
governify-registry 0.0.1, built on: 2017-01-30
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
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
var request = require("request");

// Names
var BASE_FILENAME = "T14-L2-S12-minimal-states";
var BASE_EXPECTED_FILENAME = "T14-L2-S12-minimal-states-getresponse";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/v3";

// Required files
var registry = require('../../../../index');
var testUtils = require('../../../utils');
var config = require('../../../config.json');
// var agreementStatesFile = require('../expected/states/' + BASE_FILENAME + '.' + FILENAME_EXTENSION);
var expectedAgreementStates = require('../expected/states/' + BASE_EXPECTED_FILENAME + '.' + FILENAME_EXTENSION);
var schema = require("../../../../src/schemas/stateSchema.json");

// Registry endpoints
var agreementStatesPath = SERVER_PATH + '/agreements';
// var statesPath = SERVER_PATH + '/states';


describe("Agreement states unit tests v3 ...", function () {

    // Deploy registry before all tests
    before(function (done) {
        testUtils.dropDB(function (err) {
            if (!err) {
                registry.deploy(config, function () {
                    done();
                });
            }
        });
    });

    // Remove all data and undeploy registry after all tests
    after(function (done) {
        registry.undeploy(function () {
            testUtils.dropDB(function (err) {
                done(err);
            });
        });
    });


    // Get all the agreement states (there should not be any)
    describe("GET /states", function () {
        describe("Get all the agreement states (there should not be any)", function () {

            var _body;
            var options = {
                uri: agreementStatesPath,
                method: 'GET'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns empty array", function (done) {
                expect(JSON.parse(_body).length === 0);
                done();
            });

        });
    });

    // Expect an error when there is any agreement state with this agreement ID
    describe("GET /states/:id", function () {
        describe("Expect an error when there is any agreement state with this agreement ID", function () {

            var _json;
            var options = {
                uri: agreementStatesPath + "/" + BASE_FILENAME,
                method: 'GET'
            };

            it("returns status 404 with error message", function (done) {
                request(options, function (error, response, body) {
                    _json = JSON.parse(body);
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });

    describe("State model validation", function () {

        it("the stored agreement state is valid according to the schema", function (done) {

            expect(testUtils.validateModel(expectedAgreementStates, schema));
            done();
        });
    });

    //// Insert an agreement state in database manually
    //describe("POST /agreements", function () {
    //    describe("Create an agreement", function () {
    //
    //        var postResponse;
    //        var options = {
    //            uri: agreementStatesPath,
    //            method: 'POST',
    //            json: agreementStateFile
    //        };
    //
    //        it("returns status 200", function (done) {
    //            request(options, function (error, response, body) {
    //                expect(response.statusCode).to.equal(200);
    //                postResponse = body;
    //                done();
    //            });
    //        });
    //
    //        it("returns OK message", function (done) {
    //            expect(postResponse === "OK").to.be.ok;
    //            done();
    //        });
    //    });
    //});
    //
    //// Get an existent agreement state by agreement ID
    //    describe("GET /states/:id", function () {
    //        describe("Get an existent agreement state by agreement ID", function () {
    //
    //            var agreementJson;
    //            var _body;
    //            var _json;
    //            var options = {
    //                uri: agreementStatesPath + "/" + BASE_FILENAME,
    //                method: 'GET'
    //            };
    //
    //            it("returns status 200", function (done) {
    //                request(options, function (error, response, body) {
    //                    _body = body;
    //                    expect(response.statusCode).to.equal(200);
    //                    done();
    //                });
    //            });
    //
    //            it("returns JSON with values", function (done) {
    //                agreementJson = JSON.parse(_body);
    //                expect(!!agreementJson).to.be.ok;
    //                done();
    //            });
    //
    //            it("returns expected agreement", function (done) {
    //                json = agreementJson;
    //                delete _json['_id'];
    //                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
    //                done();
    //            });
    //
    //            it("returns valid agreement", function (done) {
    //                expect(testUtils.validateModel(agreementJson, schema)).to.be.ok;
    //                done();
    //            });
    //        });
    //    });
    //
    //// Get all agreement states
    //    describe("GET /states", function () {
    //        describe("Get all agreement states", function () {
    //
    //            var agreementsJson;
    //            var _json;
    //            var options = {
    //                uri: agreementStatesPath,
    //                method: 'GET'
    //            };
    //
    //            it("returns status 200", function (done) {
    //                request(options, function (error, response, body) {
    //                    agreementsJson = JSON.parse(body);
    //                    expect(response.statusCode).to.equal(200);
    //                    done();
    //                });
    //            });
    //
    //            // Expecting 1 agreement state
    //            it("returns 1 agreement state", function (done) {
    //                expect(agreementsJson.length === 1).to.be.ok;
    //                done();
    //            });
    //
    //            it("returns expected agreement state", function (done) {
    //                _json = agreementsJson[0];
    //                delete _json['_id'];
    //                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
    //                done();
    //            });
    //
    //            it("returns valid agreement state", function (done) {
    //                expect(testUtils.validateModel(agreementsJson[0], schema)).to.be.ok;
    //                done();
    //            });
    //
    //        });
    //    });

    // Remove all the agreement states
    describe("DELETE /states", function () {
        describe("Remove all the agreement states", function () {

            var _body;
            var options = {
                uri: agreementStatesPath,
                method: 'DELETE'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

        });
    });

    // Get all agreement states after removing them
    describe("GET /states", function () {
        describe("Get all agreement states after removing them", function () {

            var _body;
            var options = {
                uri: agreementStatesPath,
                method: 'GET'
            };
            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });
            it("returns empty array", function (done) {
                expect(JSON.parse(_body).length === 0);
                done();
            });
        });
    });
});