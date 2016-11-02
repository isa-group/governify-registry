'use strict';

var expect = require('chai').expect,
    request = require('request'),
    ppinot = require('./expected/ppinotData'),
    registry = require('../../../index'),
    agreement = require('./expected/agreements'),
    utils = require('../../../utils/utils'),
    testUtils = require('../../utils'),
    Promise = require('bluebird');

var agreementMock = {
    context: {
        validity: {
            timeZone: 'Europe/Madrid'
        }
    }
}

describe("Integral TEST V3", function () {
    before((done) => {
        ppinot.listen(5000, () => {
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
        });
    });
    after((done) => {
        registry.undeploy(() => {
            testUtils.dropDB((err) => {
                done();
            });
        });
    })


    this.timeout(1000000);
    describe('Guarantees request', () => {
        it('Get guarantees all periods', (done) => {
            request.get({
                url: 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees',
                json: true
            }, (err, res, body) => {
                var expectedResults = require('./expected/guarantees.json');
                var results = body;
                expect(results).to.eql(expectedResults);
                done();
            });
        });
        it('Get guarantees period by period', (done) => {
            var results = [];
            var periods = utils.getPeriodsFrom(agreementMock, {
                initial: '2014-10-16'
            });
            //console.log(periods);
            Promise.each(periods, (period) => {
                return new Promise((resolve, reject) => {
                    var url = 'http://localhost:5001/api/v3/states/T14-L2-S12-minimal/guarantees?from=' + period.from.toISOString() + '&to=' + period.to.toISOString();
                    console.log(url);
                    request.get({
                        url: url,
                        json: true
                    }, (err, res, body) => {
                        if (err) return reject();
                        if (res && res.statusCode !== 200) return reject();
                        return resolve(body);
                    });
                }).then((body) => {
                    //console.log(body);
                    body.forEach((element) => {
                        results.push(element);
                    });
                }, (err) => {
                    expect(false);
                    done();
                });
            }).then((res) => {
                var expectedResults = require('./expected/guarantees.json');
                expect(results).to.eql(expectedResults);
                done();
            }, (error) => {
                expect(false);
                done();
            });
        });
    });
    // describe('Pricing K00', () => {
    //     it('Get K00 P1', (done) => {
    //         request.post({
    //             url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
    //             json: true,
    //             body: {
    //                 scope: {
    //                     priority: "P1",
    //                     node: "*",
    //                     center: "*",
    //                     serviceLine: "",
    //                     activity: ""
    //                 },
    //                 window: {
    //                     type: "static",
    //                     period: "monthly",
    //                     initial: "2014-10-16T22:00:00.000Z",
    //                     timeZone: "Europe/Madrid"
    //                 },
    //                 logs: {
    //                     casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
    //                 }
    //             }
    //         }, (err, res, body) => {
    //             var expectedResults = require('./expected/k00_p1.json');
    //             var results = body;
    //             expect(results).to.eql(expectedResults);
    //             done();
    //         });
    //     });
    //     it('Get K00 P2', (done) => {
    //         request.post({
    //             url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
    //             json: true,
    //             body: {
    //                 scope: {
    //                     priority: "P2",
    //                     node: "*",
    //                     center: "*",
    //                     serviceLine: "",
    //                     activity: ""
    //                 },
    //                 window: {
    //                     type: "static",
    //                     period: "monthly",
    //                     initial: "2014-10-16T22:00:00.000Z",
    //                     timeZone: "Europe/Madrid"
    //                 },
    //                 logs: {
    //                     casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
    //                 }
    //             }
    //         }, (err, res, body) => {
    //             var expectedResults = require('./expected/k00_p2.json');
    //             var results = body;
    //             expect(results).to.eql(expectedResults);
    //             done();
    //         });
    //     });
    //     it('Get K00 P3', (done) => {
    //         request.post({
    //             url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
    //             json: true,
    //             body: {
    //                 scope: {
    //                     priority: "P3",
    //                     node: "*",
    //                     center: "*",
    //                     serviceLine: "",
    //                     activity: ""
    //                 },
    //                 window: {
    //                     type: "static",
    //                     period: "monthly",
    //                     initial: "2014-10-16T22:00:00.000Z",
    //                     timeZone: "Europe/Madrid"
    //                 },
    //                 logs: {
    //                     casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
    //                 }
    //             }
    //         }, (err, res, body) => {
    //             var expectedResults = require('./expected/k00_p3.json');
    //             var results = body;
    //             expect(results).to.eql(expectedResults);
    //             done();
    //         });
    //     });
    // });
});
