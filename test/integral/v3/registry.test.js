'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    request = require('request'),
    registry = require('../../../index'),
    agreement = require('./expected/agreements'),
    utils = require('../../../utils/utils'),
    testUtils = require('../../utils'),
    fs = require('fs'),
    Promise = require('bluebird');

var agreementMock = {
    context: {
        validity: {
            timeZone: 'Europe/Madrid'
        }
    }
}

describe("Integration TEST V3", function () {
    before((done) => {
        // ppinot.listen(5000, () => {
        testUtils.dropDB((err) => {
            registry.deploy(require('../../config.json'), (server) => {
                request.post({
                    url: 'http://localhost:5001/api/v3/agreements',
                    body: agreement,
                    json: true
                }, (err, res, body) => {
                    if (err)
                        console.log(err);
                    done();
                });
            });
        });
        // });
    });
    after((done) => {
        registry.undeploy(() => {
            testUtils.dropDB((err) => {
                if (err) done(err);
                else done();
            });
        });
    })


    this.timeout(1000000);
    // describe('Guarantees request', () => {
    it('Get guarantees all periods', (done) => {
        request.get({
            url: 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees',
            json: true
        }, (err, res, body) => {
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

    it('Get guarantees period by period', (done) => {
        var results = [];
        var periods = utils.time.getPeriods(agreementMock, {
            initial: '2016-01-16',
            end: '2016-12-16',
            timeZone: 'Europe/Madrid'
        });

        Promise.each(periods, (period) => {
            return new Promise((resolve, reject) => {
                var url = 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees?from=' + period.from.toISOString() + '&to=' + period.to.toISOString();

                request.get({
                    url: url,
                    json: true
                }, (err, res, body) => {
                    if (err) return reject();
                    if (res && res.statusCode !== 200) return reject();
                    return resolve(body);
                });
            }).then((body) => {
                body.forEach((element) => {
                    results.push(element);
                });
            }, (err) => {
                done(err);
            });
        }).then((res) => {
            var expectedResults = require('./expected/guaranteesByMonth.json');
            //fs.writeFileSync(__dirname + '/guarantees.results.v3.month.json', JSON.stringify(results.sort(testUtils.orderByCenterAndId), null, 2));
            try {
                expect(testUtils.arrayEqual(results, expectedResults));
                done();
            } catch (e) {
                done(e);
            }
        }, (error) => {
            done(error);
        });
    });

    it('Get agreement all periods', (done) => {
        request.get({
            url: 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal',
            json: true
        }, (err, res, body) => {
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

    // });
});
