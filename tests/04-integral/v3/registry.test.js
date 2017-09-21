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

var expect = require('chai').expect,
    request = require('request'),
    registry = require('../../../index'),
    agreement = require('./expected/agreements'),
    utils = require('../../../src/utils/utils'),
    testUtils = require('../../utils'),
    Promise = require('bluebird');

var agreementMock = {
    context: {
        validity: {
            timeZone: 'Europe/Madrid'
        }
    }
};

describe("Integration TEST V3", function () {
    before(function (done) {
        // ppinot.listen(5000, function () {
        testUtils.dropDB(function () {
            registry.deploy(require('../../config.json'), function () {
                request.post({
                    url: 'http://localhost:5001/api/v3/agreements',
                    body: agreement,
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        console.log(err + res + body);
                    }
                    done();
                });
            });
        });
        // });
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


    this.timeout(1000000);

    it('Get guarantees all periods', function (done) {
        request.get({
            url: 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees',
            json: true
        }, function (err, res, body) {
            var expectedResults = require('./expected/guarantees.json');
            var results = body;
            // fs.writeFileSync(__dirname + '/guarantees.results.v3.json', JSON.stringify(results.sort(orderByCenterAndId)));
            try {
                expect(testUtils.arrayEqual(results, expectedResults));
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('Get guarantees period by period', function (done) {
        var results = [];
        var periods = utils.time.getPeriods(agreementMock, {
            initial: '2016-01-16',
            end: '2016-12-16',
            timeZone: 'Europe/Madrid'
        });

        Promise.each(periods, function (period) {
            return new Promise(function (resolve, reject) {
                var url = 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees?from=' + period.from.toISOString() + '&to=' + period.to.toISOString();

                request.get({
                    url: url,
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        return reject();
                    }
                    if (res && res.statusCode !== 200) {
                        return reject();
                    }
                    return resolve(body);
                });
            }).then(function (body) {
                body.forEach(function (element) {
                    results.push(element);
                });
            }, function (err) {
                done(err);
            });
        }).then(function () {
            var expectedResults = require('./expected/guarantees.json');
            //fs.writeFileSync(__dirname + '/guarantees.results.v3.month.json', JSON.stringify(results.sort(testUtils.orderByCenterAndId), null, 2));
            try {
                expect(testUtils.arrayEqual(results, expectedResults));
                done();
            } catch (e) {
                done(e);
            }
        }, function (error) {
            done(error);
        });
    });

    it('Get agreement all periods', function (done) {
        request.get({
            url: 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal',
            json: true
        }, function (err, res, body) {
            var expectedResults = require('./expected/agreementState.json');
            var results = body;
            // fs.writeFileSync(__dirname + '/agreement.results.v3.json', JSON.stringify(results.sort(testUtils.orderByCenterAndId), null, 2));
            try {
                expect(testUtils.arrayEqual(results, expectedResults));
                done();
            } catch (e) {
                done(e);
            }
        });
    });

});