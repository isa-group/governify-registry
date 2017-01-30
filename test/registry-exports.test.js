/*!
governify-registry 0.0.1, built on: 2017-01-30
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
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
