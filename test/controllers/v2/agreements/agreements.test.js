var mongoose = require('mongoose');
var expect = require("chai").expect;
var request = require("request");
var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var fs = require('fs');

var config = require('../../../config.json');
var registry = require('../../../../index');

var server = "localhost";
var port = 5001;

describe("Agreements POST unit tests", function () {

    let url = "http://" + server + ":" + port + "/api/v2/agreements";
    let contract = require('../../../integral/expected/agreements/T14-L2-S12-minimal.json');
    let options = {
        uri: url,
        method: 'POST',
        json: contract
    };

    before((done) => {
        registry.deploy(
            config,
            () => { done(); });
    });

    after((done) => {
       request.delete({
            url: 'http://localhost:5001/api/v2/agreements'
        }, (err, res, body) => {
            if (err)
                console.log(err);

            request.delete({
                url: 'http://localhost:5001/api/v2/states'
            }, (err, res, body) => {
                if (err)
                    console.log(err);
                registry.undeploy(() => {
                    done();
                });
            });
        });
    });

    describe("Agreements", function () {
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
});

var isValidContract = (contract) => {

    let isValid = true;
    // let obj = {
    //     "" : ["id", "version", "type", "context", "terms"],
    //     "context": ["definitions", "infrastructure", "validity", "consumer", "provider"],
    //     "context.definitions": ["logs", "scopes", "schemas"],
    //     "context.definitions.logs": ["jira", "casdm"],
    //     "context.definitions.logs.jira": ["scopes", "stateUri", "uri"],
    //     "context.definitions.logs.jira.scopes": ["SPU"],
    //     "context.definitions.logs.jira.scopes.SPU": ["center", "node", "priority"],
    //     "terms" : ["guarantees", "metrics", "pricing"]
    // };

    // for (keyPath in obj) {
    //     if (obj.hasOwnProperty(keyPath)) {
    //         obj[keyPath].forEach((k) => {
    //             console.log(k);
    //             isValid = (keyPath === "") ? 
    //                 k in contract: 
    //                 k in eval("contract." + keyPath.split(".").toString().replace(",","."));

    //             // Stop forEach
    //             if (!isValid) return false;

    //         });
    //     }
    // }


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