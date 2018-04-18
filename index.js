/*!
governify-registry 3.0.1, built on: 2018-04-18
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

//Server dependencies
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

//Self dependencies
var config = require('./src/config');
var db = require('./src/database');
var swaggerUtils = require('./src/utils/utils').swagger;
var middlewares = require('./src/utils/utils').middlewares;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// Bypassing 405 status put by swagger when no request handler is defined
app.options("/*", (req, res, next) => {
    return res.sendStatus(200);
});

// middleware to control when an agreement state process is already in progress
app.use('/api/v2/states/:agreement', middlewares.stateInProgress);
app.use('/api/v3/states/:agreement', middlewares.stateInProgress);
app.use('/api/v4/states/:agreement', middlewares.stateInProgress);
app.use('/api/v5/states/:agreement', middlewares.stateInProgress);

// latest documentation redirection
const CURRENT_API_VERSION = "v5";
app.use('/api/latest/docs', function (req, res) {
    res.redirect('/api/' + CURRENT_API_VERSION + '/docs');
});
app.use('/api/latest/api-docs', function (req, res) {
    res.redirect('/api/' + CURRENT_API_VERSION + '/api-docs');
});

//servin package info 
app.use('/api/info', function (req, res) {
    res.json(require('./package.json'));
});
/**
 * Registry module.
 * @module registry
 * @requires express
 * @requires http
 * @requires body-parser
 * @requires config
 * @requires database
 * @requires swagger
 * @requires middlewares
 * */
module.exports = {
    deploy: _deploy,
    undeploy: _undeploy
};


/**
 * statesAgreementGET.
 * @param {Object} configurations configuration object
 * @param {function} callback callback function
 * @alias module:registry.deploy
 * */
function _deploy(configurations, callback) {
    if (configurations && configurations.loggerLevel) {
        config.logger.transports.console.level = configurations.loggerLevel;
    }
    config.logger.info('Trying to deploy server');
    if (configurations) {
        config.logger.info('Reading configuration...');
        for (var c in configurations) {
            var prop = configurations[c];
            config.logger.info('Setting property' + c + ' with value ' + prop);
            config.setProperty(c, prop);
        }
    }

    db.connect(function (err) {
        config.logger.info('Trying to connect to database');
        if (!err) {
            //list of swagger documents, one for each version of the api.
            var swaggerDocs = [
                swaggerUtils.getSwaggerDoc(1),
                swaggerUtils.getSwaggerDoc(2),
                swaggerUtils.getSwaggerDoc(3),
                swaggerUtils.getSwaggerDoc(4),
                swaggerUtils.getSwaggerDoc(5)
            ];
            //initialize swagger middleware for each swagger documents.
            swaggerUtils.initializeMiddleware(app, swaggerDocs, function () {

                var serverPort = process.env.PORT || config.port;
                if (!module.exports.server) {
                    module.exports.server = http.createServer(app);
                }
                module.exports.server.timeout = 24 * 3600 * 1000; // 24h

                if (process.env.HTTPS_SERVER === "true") {
                    var securePort = 443;
                    https.createServer({
                        key: fs.readFileSync('certs/privkey.pem'),
                        cert: fs.readFileSync('certs/cert.pem')
                    }, app).listen(securePort, function () {
                        config.logger.info('HTTPS_SERVER mode');
                        config.logger.info('Your server is listening on port %d (https://localhost:%d)', serverPort, serverPort);
                        config.logger.info('Swagger-ui is available on https://localhost:%d/api/%s/docs', serverPort, CURRENT_API_VERSION);
                    });
                }

                module.exports.server.listen(serverPort, function () {
                    config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
                    config.logger.info('Swagger-ui is available on http://localhost:%d/api/%s/docs', serverPort, CURRENT_API_VERSION);
                    if (callback) {
                        callback(module.exports.server);
                    }
                });
            });
        } else {
            config.logger.error('Database connection failed', err);

        }
    });
}


/**
 * _undeploy.
 * @param {function} callback callback function
 * @alias module:registry.undeploy
 * */
function _undeploy(callback) {
    db.close(function () {
        module.exports.server.close(function () {
            config.logger.info('Server has been closed');
            callback();
        });
    });
}