const mongoose = require('mongoose'),
    expect = require("chai").expect,
    request = require("request"),
    jsyaml = require('js-yaml'),
    $RefParser = require('json-schema-ref-parser'),
    fs = require('fs'),

    config = require('../../../config.json'),
    registry = require('../../../../index'),
    testUtils = require('../../../utils'),

    server = "localhost",
    port = 5001;

describe("Agreements unit tests...", function () {

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

    let url = "http://" + server + ":" + port + "/api/v2/agreements";
    let contractFile = require('../../../integral/expected/agreements/T14-L2-S12-minimal.json');
    let options = {
        uri: url,
        method: 'POST',
        json: contractFile
    };

    describe("POST /agreements unit tests", function () {

        var contractResponse = null;
        var reqResponse = null;

        it("returns status 200", (done) => {
            request(options, (error, response, body) => {
                expect(response.statusCode).to.equal(200);
                reqResponse = body;
                contractResponse = body.data;
                done();
            });
        });

        it("returns JSON response", (done) => {
            expect(!!JSON.stringify(reqResponse)).to.be.ok;
            done();
        });

        it("returns not empty contract", (done) => {
            expect(!!contractResponse).to.be.ok;
            done();
        });

        it("returns valid contract", (done) => {
            expect(isValidContract(contractResponse) == true).to.be.ok
            done();
        });

        it("returns contract with same id", (done) => {
            expect(contractResponse.id === contractFile.id).to.be.ok
            done();
        });
    });
});

var isValidContract = (contract) => {

    let isValid = true;
    let Ajv = require('ajv');
    let ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    let schema = require("../../../../schemas/agreementSchema.json");
    let valid = ajv.validate(schema, contract);

    if (!valid) {
        console.log(ajv.errors);
        isValid = false;
    }

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
