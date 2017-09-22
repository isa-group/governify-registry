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
var request = require("request");

// Names
var BASE_FILENAME = "T14-L2-S12-minimal";
var BASE_EXPECTED_FILENAME = "T14-L2-S12-minimal-getresponse";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/v3";

// Required files
var registry = require('../../../../index');
var testUtils = require('../../../utils');
var config = require('../../../config.json');
var agreementFile = require('../expected/agreements/' + BASE_FILENAME + '.' + FILENAME_EXTENSION);
var expectedAgreement = require('../expected/agreements/' + BASE_EXPECTED_FILENAME + '.' + FILENAME_EXTENSION);
var schema = require("../../../../src/schemas/agreementSchema.json");

// Registry endpoints
var agreementsPath = SERVER_PATH + '/agreements';
//var statesPath = SERVER_PATH + '/states';

describe("Agreement unit tests v3...", function () {

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
            testUtils.dropDB(function () {
                done();
            });
        });
    });

    // Get all agreements when there is no agreement nonexistent agreement by agreement ID
    describe("GET /agreements", function () {
        describe("Get all agreements when there is no agreement", function () {
            var _body;
            var options = {
                uri: agreementsPath,
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

    // Get a nonexistent agreement by agreement ID
    describe("GET /agreements/:id", function () {
        describe("Expect an error when there is no agreement with ID", function () {

            var _json;
            var options = {
                uri: agreementsPath + "/" + BASE_FILENAME,
                method: 'GET'
            };

            it("returns status 404 with error message", function (done) {
                request(options, function (error, response, body) {
                    _json = JSON.parse(body);
                    expect(response.statusCode).to.equal(404);
                    expect(_json.code === 404 && _json.message === "There is no agreement with id: " + BASE_FILENAME);
                    done();
                });
            });
        });
    });

    // Insert an agreement in database using 'POST /agreements' request
    describe("POST /agreements", function () {
        describe("Create an agreement", function () {

            var postResponse;
            var options = {
                uri: agreementsPath,
                method: 'POST',
                json: agreementFile
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    expect(response.statusCode).to.equal(200);
                    postResponse = body;
                    done();
                });
            });

            it("returns OK message", function (done) {
                expect(postResponse === "OK");
                done();
            });
        });
    });

    // Get a existent agreement by ID
    describe("GET /agreements/:id", function () {
        describe("Get an agreement by agreement ID", function () {

            var agreementJson;
            var _body;
            var _json;
            var options = {
                uri: agreementsPath + "/" + BASE_FILENAME,
                method: 'GET'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns JSON with values", function (done) {
                agreementJson = JSON.parse(_body);
                expect(!!agreementJson);
                done();
            });

            it("returns expected agreement", function (done) {
                _json = agreementJson;
                delete _json._id;
                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreement));
                done();
            });

            it("returns valid agreement", function (done) {
                expect(testUtils.validateModel(agreementJson, schema));
                done();
            });
        });
    });

    // Get all agreements
    describe("GET /agreements", function () {
        describe("Get all agreements", function () {

            var agreementsJson;
            var _json;
            var options = {
                uri: agreementsPath,
                method: 'GET'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    agreementsJson = JSON.parse(body);
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            // Expecting 1 agreement
            it("returns 1 agreement", function (done) {
                expect(agreementsJson.length === 1);
                done();
            });

            it("returns expected agreement", function (done) {
                _json = agreementsJson[0];
                delete _json._id;
                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreement));
                done();
            });

            it("returns valid agreement", function (done) {
                expect(testUtils.validateModel(agreementsJson[0], schema));
                done();
            });

        });
    });

    // Delete all agreements
    describe("DELETE /agreements", function () {
        describe("Remove all agreements", function () {

            var res = null;
            var options = {
                uri: agreementsPath,
                method: 'DELETE'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    res = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns OK message", function (done) {
                expect(res === "OK");
                done();
            });

        });
    });

    // Get all agreements when there is no agreement nonexistent agreement by agreement ID
    describe("GET /agreements", function () {
        describe("Get all agreements after removing them", function () {

            var _body = null;
            var options = {
                uri: agreementsPath,
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