var mongoose = require('mongoose');
var expect = require("chai").expect;
var request = require("request");
var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var fs = require('fs');
var config = require('../../../../config/index');

var server = "localhost";
var port = config.port || 8081;

describe("Agreements GET", function () {
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

});