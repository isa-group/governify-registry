'use strict';

var expect = require('chai').expect,
    request = require('request');

describe('Registry Module Tests', () => {
    var registry = require('../index');
    it('.deploy() Function', () => {
        expect(registry.deploy).to.not.null;
    });
    it('.undeploy Function', () => {
        expect(registry.undeploy).to.not.null;
    });
});
