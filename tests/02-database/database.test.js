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
