var mongoose = require('mongoose');
var expect = require("chai").expect;
var request = require("request");
var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var fs = require('fs');

var config = require('../../../../config/index');
var registry = require('../../../../index');

var server = "localhost";
var port = config.port || 8081;

describe("Agreements POST unit tests", function () {

    let url = "http://" + server + ":" + port + "/api/v2/agreements";
    let contract = require('../../../integral/expected/agreements/T14-L2-S12-minimal.json');
    let options = {
        uri: url,
        method: 'POST',
        json: contract
    };

    before((done) => {
        registry.deploy({
            port: port,
            database: {
                url: "mongodb://" + server + ":27017",
                db_name: "registry-tests"
            }
        }, () => { done() });
    });

    after((done) => {
        registry.undeploy(done);
    });

    it("returns new contract", (done) => {
        request(options, (error, response, body) => {

            // return status 200
            expect(response.statusCode).to.equal(200);

            // return JSON content
            expect(body.data).to.be.ok;



            // return JSON valid contract in body.data
            expect(isValidContract(body.data)).to.be.ok;

            done();
        });
    });
});

var isValidContract = (contract) => {

    // Contract keys by level
    let simpleKeys = ["id", "version", "type", "context", "terms"];
    let contextKeys = ["definitions", "infrastructure", "validity", "consumer", "provider"];
    let termsKeys = ["guarantees", "metrics", "pricing"];

    // let contextDefinitionsKeys = ["logs", "scopes", "schemas"];
    // let contextDefinitionsLogsKeys = ["jira", "casdm"];
    // let jiraContextDefinitionsLogsKeys = ["scopes", "stateUri", "uri"];

    let isValid = true;

    simpleKeys.forEach((k) => {
        if (Object.keys(contract).indexOf(k) === -1) {
            isValid = false;
            return false;
        }
    });

    if (!isValid) return isValid;

    contextKeys.forEach((k) => {
        if (Object.keys(contract.context).indexOf(k) === -1) {
            isValid = false;
            return false;
        }
    });

    if (!isValid) return isValid;

    termsKeys.forEach((k) => {
        if (Object.keys(contract.terms).indexOf(k) === -1) {
            isValid = false;
            return false;
        }
    });

    if (!isValid) return isValid;

    return isValid;
};

/*describe("Agreements GET", function () {
    var url = "http://" + server + ":" + port + "/api/v2/agreements";

    it("returns valid models", function (done) {
        request(url, function (error, response, body) {

            // return status 200
            expect(response.statusCode).to.equal(200);

            // returns valid array
            var arr = JSON.parse(body);
            expect(arr).to.be.a('array');

            // returns valid models
            arr.forEach(function (ag, index, agreements) {
                $RefParser.dereference(ag, function (err, schema) {
                    expect(err).to.not.exist;

                    var jsonModel = jsyaml.safeLoad(fs.readFileSync('./models/agreementModel.json'));
                    $RefParser.dereference(jsonModel, function (err, model) {
                        if (err)
                            expect(err).to.not.exist;

                        var modelSchema = new mongoose.Schema(model, {
                            minimize: false
                        });
                        var AgreementModel = mongoose.model('AgreementModel', modelSchema);
                        var agreement = new AgreementModel(schema);
                        agreement.validate(function (err) {
                            expect(err).to.not.exist;
                        });
                    });
                });
            });

            done();
        });
    });

});*/