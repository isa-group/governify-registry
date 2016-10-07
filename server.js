'use strict';

var registry = require('./index.js');
var config = require('./config');

config.logger.info('Deploy request received');
registry.deploy(null, function (server) {
    config.logger.info('Deploy successfully done');
});
