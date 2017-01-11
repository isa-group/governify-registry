'use strict';

var expect = require('chai').expect,
    request = require('request'),
    dockerCompose = require('docker-composer-manager');

describe('Clear infrastructure', function () {
    this.timeout(40000);
    it('docker-compose down', (done) => {
        dockerCompose.dockerComposeDown(__dirname + '/../', '', (stdout, stderr) => {
            expect(true);
            done();
        }, (err, stderr) => {
            done(err);
            expect(false);
        });
    });
});
