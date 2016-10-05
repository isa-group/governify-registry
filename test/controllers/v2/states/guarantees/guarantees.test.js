var mongoose = require('mongoose');
var expect = require("chai").expect;
var request = require("request");
var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var fs = require('fs');
var config = require('../../../../config/index');

var server = "localhost";
var port = config.port || 8081;

describe("Guarantees GET", function () {
    var url = "http://" + server + ":" + port + "/api/v2/states/" + agreementId + "/guarantees";

    it("returns valid models", function (done) {
        request(url, function (error, response, body) {

            // return status 200
            expect(response.statusCode).to.equal(200);

            // returns valid array
            var arr = JSON.parse(body);
            expect(arr).to.be.a('array');

            // returns valid models

            // TODO validate guarantees

            done();
        });
    });

});
