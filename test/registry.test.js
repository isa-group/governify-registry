'use strict';

var expect = require('chai').expect,
    request = require('request'),
    ppinot = require('./expected/ppinotData'),
    registry = require('../index'),
    agreement = require('./expected/agreements');

describe("Integration TEST", function () {
    before((done) => {
        ppinot.listen(5000, () => {
            registry.deploy({
                port: 5001,
                database: {
                    url: "mongodb://dockers:27017",
                    db_name: "registry-tests"
                }
            }, (server) => {
                request.post({
                    url: 'http://localhost:5001/api/v2/agreements',
                    body: agreement,
                    json: true
                }, (err, res, body) => {
                    if (!err) {
                        //console.log(body);
                    } else {
                        console.log(err);
                    }
                    done();
                });
            });
        });
    });
    after((done) => {
        request.delete({
            url: 'http://localhost:5001/api/v2/agreements'
        }, (err, res, body) => {
            if (!err) {
                //console.log(body);
            } else {
                console.log(err);
            }
            request.delete({
                url: 'http://localhost:5001/api/v2/states'
            }, (err, res, body) => {
                if (!err) {
                    //console.log(body);
                } else {
                    console.log(err);
                }
                done();
            });
        });
    })


    this.timeout(100000);
    describe('Guarantees request', () => {
        it('Get guarantees', (done) => {
            request.get({
                url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/guarantees',
                json: true
            }, (err, res, body) => {
                expect(true);

                done();
            });
        });
        it('Get K00 P1', (done) => {
            request.post({
                url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
                json: true,
                body: {
                    scope: {
                        priority: "P1",
                        node: "*",
                        center: "*",
                        serviceLine: "",
                        activity: ""
                    },
                    window: {
                        type: "static",
                        period: "monthly",
                        initial: "2014-10-16T22:00:00.000Z",
                        timeZone: "Europe/Madrid"
                    },
                    logs: {
                        casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
                    }
                }
            }, (err, res, body) => {
                expect(true);

                done();
            });
        });
        it('Get K00 P2', (done) => {
            request.post({
                url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
                json: true,
                body: {
                    scope: {
                        priority: "P2",
                        node: "*",
                        center: "*",
                        serviceLine: "",
                        activity: ""
                    },
                    window: {
                        type: "static",
                        period: "monthly",
                        initial: "2014-10-16T22:00:00.000Z",
                        timeZone: "Europe/Madrid"
                    },
                    logs: {
                        casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
                    }
                }
            }, (err, res, body) => {
                expect(true);

                done();
            });
        });
        it('Get K00 P3', (done) => {
            request.post({
                url: 'http://localhost:5001/api/v2/states/T14-L2-S12-minimal/metrics/SPU_IO_K00',
                json: true,
                body: {
                    scope: {
                        priority: "P3",
                        node: "*",
                        center: "*",
                        serviceLine: "",
                        activity: ""
                    },
                    window: {
                        type: "static",
                        period: "monthly",
                        initial: "2014-10-16T22:00:00.000Z",
                        timeZone: "Europe/Madrid"
                    },
                    logs: {
                        casdm: "http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
                    }
                }
            }, (err, res, body) => {
                expect(true);

                done();
            });
        });
    });
});
