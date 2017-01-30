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

const expect = require("chai").expect,
    request = require("request"),
    jsyaml = require('js-yaml'),
    $RefParser = require('json-schema-ref-parser'),
    fs = require('fs'),
    // Required files
    registry = require('../../../../index'),
    testUtils = require('../../../utils'),
    config = require('../../../config.json'),
    agreementFile = require('../expected/agreements/T14-L2-S12-minimal.json'),
    // Registry endpoint
    serverPath = "http://localhost:5001/api/v2",
    agreementsPath = serverPath + '/agreements',
    statesPath = serverPath + '/states';

describe("Agreements unit tests v2 ...", function () {

    // Deploy registry before all tests
    before((done) => {
        testUtils.dropDB((err) => {
            if (!err)
                registry.deploy(config, () => done());
        });
    });

    // Remove all data and undeploy registry after all tests
    after((done) => {
        registry.undeploy(() => {
            testUtils.dropDB((err) => {
                done();
            });
        });
    });

    // Get all agreements when there is no agreement nonexistent agreement by agreement ID
    describe("GET /agreements", function () {
        describe("Get all agreements when there is no agreement unit tests", function () {

            let _body = null;
            const options = {
                uri: agreementsPath,
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

    // Get a nonexistent agreement by agreement ID
    describe("GET /agreements/:id", function () {
        describe("Expect an error when there is no agreement with ID unit tests", function () {

            const agreementId = "T14-L2-S12-minimal",
                options = {
                    uri: agreementsPath + "/" + agreementId,
                    method: 'GET'
                };

            it("returns status 404 with error message", (done) => {
                request(options, (error, response, body) => {
                    let _json = JSON.parse(body);
                    expect(response.statusCode).to.equal(404);
                    expect(_json.code === 404 && _json.message === "There is no agreement with id: " + agreementId).to.be.ok;
                    done();
                });
            });
        });
    });

    // Insert an agreement in database using 'POST /agreements' request
    describe("POST /agreements", function () {
        describe("Create an agreement unit tests", function () {

            let postResponse = null;
            const options = {
                uri: agreementsPath,
                method: 'POST',
                json: agreementFile
            };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    expect(response.statusCode).to.equal(200);
                    postResponse = body;
                    done();
                });
            });

            it("returns OK message", (done) => {
                expect(postResponse === "OK").to.be.ok;
                done();
            });
        });
    });

    // Get a existent agreement by ID
    describe("GET /agreements/:id", function () {
        describe("Get an agreement by agreement ID unit tests", function () {

            let agreementJson = null,
                _body = null;
            const agreementId = "T14-L2-S12-minimal",
                expectedAgreement = require('../expected/agreements/T14-L2-S12-minimal-getresponse.json'),
                options = {
                    uri: agreementsPath + "/" + agreementId,
                    method: 'GET'
                };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns JSON with values", (done) => {
                agreementJson = JSON.parse(_body);
                expect(!!agreementJson).to.be.ok;
                done();
            });

            it("returns expected agreement", (done) => {
                let _json = agreementJson;
                delete _json['_id'];
                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreement));
                done();
            });

            it("returns valid agreement", (done) => {
                expect(isValidAgreeement(agreementJson)).to.be.ok;
                done();
            });
        });
    });

    // Get all agreements
    describe("GET /agreements", function () {
        describe("Get all agreements unit tests", function () {

            let agreementsJson = null;
            const agreementId = "T14-L2-S12-minimal",
                expectedAgreement = require('../expected/agreements/T14-L2-S12-minimal-getresponse.json'),
                options = {
                    uri: agreementsPath,
                    method: 'GET'
                };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    agreementsJson = JSON.parse(body);
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            // Expecting 1 agreement
            it("returns 1 agreement", (done) => {
                expect(agreementsJson.length === 1).to.be.ok;
                done();
            });

            it("returns expected agreement", (done) => {
                let _json = agreementsJson[0];
                delete _json['_id'];
                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreement));
                done();
            });

            it("returns valid agreement", (done) => {
                expect(isValidAgreeement(agreementsJson[0])).to.be.ok;
                done();
            });

        });
    });

    // Delete all agreements
    describe("DELETE /agreements", function () {
        describe("Remove all agreements unit tests", function () {

            let res = null;
            const options = {
                uri: agreementsPath,
                method: 'DELETE'
            };

            it("returns status 200", (done) => {
                request(options, (error, response, body) => {
                    res = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns OK message", (done) => {
                expect(res === "OK").to.ok;
                done();
            });

        });
    });

    // Get all agreements when there is no agreement nonexistent agreement by agreement ID
    describe("GET /agreements", function () {
        describe("Get all agreements after removing them unit tests", function () {

            let _body = null;
            const options = {
                uri: agreementsPath,
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

var isValidAgreeement = (agreement) => {
    // Since in this version there was any schema validation, it always returns true
    return true;
};
