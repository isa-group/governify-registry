'use strict';

var expect = require('chai').expect,
    request = require('request'),
    dockerCompose = require('docker-composer-manager');

describe('Set up testing infrastructure', function () {
    this.timeout(40000);
    it('docker-compose up -d', (done) => {
        dockerCompose.dockerComposeUp(__dirname, '-d', (stdout, stderr) => {
            expect(true);
            done();
        }, (err, stderr) => {
            done();
            expect(false);
        });
    });
});

describe('Registry Module Tests', () => {
    var registry = require('../index');
    it('.deploy() Function', () => {
        expect(registry.deploy).to.not.null;
    });
    it('.undeploy Function', () => {
        expect(registry.undeploy).to.not.null;
    });
});
