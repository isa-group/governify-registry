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
    dockerCompose = require('docker-composer-manager');

describe('Clear infrastructure', function () {
    this.timeout(1000000);
    it('docker-compose down', function (done) {
        dockerCompose.dockerComposeDown(__dirname + '/../', '', function () {
            expect(true);
            done();
        }, function (err) {
            done(err);
            expect(false);
        });
    });
});