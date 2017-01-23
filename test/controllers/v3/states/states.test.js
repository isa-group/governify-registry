'use strict';

const expect = require("chai").expect;
const request = require("request");
const fs = require("fs");

// Names
const BASE_FILENAME = "T14-L2-S12-minimal-states";
const BASE_EXPECTED_FILENAME = "T14-L2-S12-minimal-states-getresponse";
const FILENAME_EXTENSION = "json";
const SERVER_PATH = "http://localhost:5001/api/v3";

// Required files
const registry = require('../../../../index');
const testUtils = require('../../../utils');
const config = require('../../../config.json');
const agreementStatesFile = require('../expected/states/' + BASE_FILENAME + '.' + FILENAME_EXTENSION);
const expectedAgreementStates = require('../expected/states/' + BASE_EXPECTED_FILENAME + '.' + FILENAME_EXTENSION);
const schema = require("../../../../schemas/stateSchema.json");

// Registry endpoints
const agreementStatesPath = SERVER_PATH + '/agreements';
const statesPath = SERVER_PATH + '/states';


describe("Agreement states unit tests v3 ...", function () {

    // Deploy registry before all tests
    before((done) => {
        testUtils.dropDB((err) => {
            if (!err) {
                registry.deploy(config, () => done());
            }
        });
    });

    // Remove all data and undeploy registry after all tests
    after((done) => {
        registry.undeploy(() =>
            testUtils.dropDB((err) => {
                done();
            }));
    });


// Get all the agreement states (there should not be any)
    describe("GET /states", function () {
        describe("Get all the agreement states (there should not be any)", function () {

            let _body;
            const options = {
                uri: agreementStatesPath,
                method: 'GET'
            };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns empty array", (done) => {
                expect(JSON.parse(_body).length === 0).to.be.ok;
                done();
            });

        });
    });

// Expect an error when there is any agreement state with this agreement ID
    describe("GET /states/:id", function () {
        describe("Expect an error when there is any agreement state with this agreement ID", function () {

            let _json;
            let options = {
                uri: agreementStatesPath + "/" + BASE_FILENAME,
                method: 'GET'
            };

            it("returns status 404 with error message", (done) => {
                request(options, (error, response, body) => {
                    _json = JSON.parse(body);
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });

    describe("State model validation", function () {
        
        it("the stored agreement state is valid according to the schema", (done) => {
            
            expect(testUtils.validateModel(expectedAgreementStates, schema)).to.be.ok;
            done();
        });
    });

//// Insert an agreement state in database manually
//describe("POST /agreements", function () {
//    describe("Create an agreement", function () {
//
//        let postResponse;
//        const options = {
//            uri: agreementStatesPath,
//            method: 'POST',
//            json: agreementStateFile
//        };
//
//        it("returns status 200", (done) => {
//            request(options, (error, response, body) => {
//                expect(response.statusCode).to.equal(200);
//                postResponse = body;
//                done();
//            });
//        });
//
//        it("returns OK message", (done) => {
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
//            let agreementJson;
//            let _body;
//            let _json;
//            const options = {
//                uri: agreementStatesPath + "/" + BASE_FILENAME,
//                method: 'GET'
//            };
//
//            it("returns status 200", (done) => {
//                request(options, (error, response, body) => {
//                    _body = body;
//                    expect(response.statusCode).to.equal(200);
//                    done();
//                });
//            });
//
//            it("returns JSON with values", (done) => {
//                agreementJson = JSON.parse(_body);
//                expect(!!agreementJson).to.be.ok;
//                done();
//            });
//
//            it("returns expected agreement", (done) => {
//                json = agreementJson;
//                delete _json['_id'];
//                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
//                done();
//            });
//
//            it("returns valid agreement", (done) => {
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
//            let agreementsJson;
//            let _json;
//            const options = {
//                uri: agreementStatesPath,
//                method: 'GET'
//            };
//
//            it("returns status 200", (done) => {
//                request(options, (error, response, body) => {
//                    agreementsJson = JSON.parse(body);
//                    expect(response.statusCode).to.equal(200);
//                    done();
//                });
//            });
//
//            // Expecting 1 agreement state
//            it("returns 1 agreement state", (done) => {
//                expect(agreementsJson.length === 1).to.be.ok;
//                done();
//            });
//
//            it("returns expected agreement state", (done) => {
//                _json = agreementsJson[0];
//                delete _json['_id'];
//                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
//                done();
//            });
//
//            it("returns valid agreement state", (done) => {
//                expect(testUtils.validateModel(agreementsJson[0], schema)).to.be.ok;
//                done();
//            });
//
//        });
//    });

// Remove all the agreement states
    describe("DELETE /states", function () {
        describe("Remove all the agreement states", function () {

            let _body;
            const options = {
                uri: agreementStatesPath,
                method: 'DELETE'
            };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns OK message", (done) => {
                expect(_body === "OK").to.ok;
                done();
            });

        });
    });

// Get all agreement states after removing them
    describe("GET /states", function () {
        describe("Get all agreement states after removing them", function () {

            let _body;
            const options = {
                uri: agreementStatesPath,
                method: 'GET'
            };
            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });
            it("returns empty array", (done) => {
                expect(JSON.parse(_body).length === 0).to.be.ok;
                done();
            });
        });
    });
});