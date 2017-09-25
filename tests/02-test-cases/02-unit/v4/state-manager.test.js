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

var __base = "../../../..";

var rewire = require('rewire'); // for accessing to non-exported methods
var expect = require('chai').expect;
var request = require('request');

// Names
var VERSION = "v4";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;
var AGREEMENT_PATH = SERVER_PATH + '/agreements';

// Used modules
var stateManager = rewire(__base + '/src/stateManager/' + VERSION + '/state-manager');
var testUtils = require(__base + '/tests/utils');
var registry = require(__base + '/index');

// Non-exported methods
var initialize = stateManager.__get__('initialize');
var _get = stateManager.__get__('_get');
var _put = stateManager.__get__('_put');
var _update = stateManager.__get__('_update');
var State = stateManager.__get__('State');
var Record = stateManager.__get__('Record');
var isUpdated = stateManager.__get__('isUpdated');
var getCurrent = stateManager.__get__('getCurrent');
var _current = stateManager.__get__('_current');
var refineQuery = stateManager.__get__('refineQuery');
var projectionBuilder = stateManager.__get__('projectionBuilder');

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var config = require(__base + '/tests/required/config.json');
// var query = require(__base + '/tests/required/windows/' + VERSION + '/' + 'window' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var stateType = undefined; //TODO: definir
var query = undefined; //TODO: definir
var value = undefined; //TODO: definir
var metadata = undefined; //TODO: definir
var logsState = undefined; //TODO: definir
var _agreement = undefined; //TODO: definir
var agreement = undefined; //TODO: definir
var agreementId = undefined; //TODO: definir
var states = undefined; //TODO: definir


// Expected files
// var expectedPricing = require(__base + '/tests/expected/agreement/' + VERSION + '/' + 'agreement' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);


describe("agreement-calculator unit tests v4...", function () {
    this.timeout(1000000);

    before(function (done) {
        testUtils.dropDB(function () {
            registry.deploy(config, function () {
                request.post({
                    url: AGREEMENT_PATH,
                    body: agreementFile,
                    json: true
                }, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
            });
        });
    });

    after(function (done) {
        registry.undeploy(function () {
            testUtils.dropDB(function (err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            initialize(_agreement).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            _get(stateType, query).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            _put(stateType, query, value, metadata).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            _update(stateType, query, logsState).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            State(value, query, metadata).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            Record(value, metadata).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            isUpdated(agreement, states).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            getCurrent(state).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            _current(state).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            refineQuery(agreementId, stateType, query).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('xxxxxxxxxx', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            projectionBuilder(stateType, query).then(function (something) {
                // expect(agreement).to.deep.equals(expectedPricing);
                expect(1).to.be.equals(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });




});