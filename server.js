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

// Add this to the VERY top of the first file loaded in your app
var apm = require('../apm-agent-nodejs').start({
    // Override service name from package.json
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space

    serviceName: 'Governify-Registry-V2',
    serviceNodeName: 'Registry',
    captureBody: 'all',
    transactionMaxSpans: -1,
    usePathAsTransactionName: true,
    abortedErrorThreshold: 0,
    distributedTracingOrigins: ['*']

  })
  

/*
 * Put here your dependencies
 */
const http = require("http"); // Use http if your app will be behind a proxy.
const https = require("https"); // Use https if your app will not be behind a proxy.
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fs = require('fs');
const path = require('path');

//Self dependencies
const config = require("./src/configurations");
const logger = require("./src/logger");
const db = require('./src/database');
const swaggerUtils = require('./src/utils').swagger;
const middlewares = require('./src/utils').middlewares;

let server = null;
const app = express();

const frontendPath = path.join(__dirname, '/public');
const serverPort = process.env.PORT || config.server.port;
const CURRENT_API_VERSION = "v6";

app.use(express.static(frontendPath));

// Default server options
app.use(compression());

logger.info("Using '%s' as HTTP body size", config.server.bodySize);
app.use(
    bodyParser.urlencoded({
        limit: config.server.bodySize,
        extended: "true"
    })
);

app.use(
    bodyParser.json({
        limit: config.server.bodySize,
        type: "application/json"
    })
);

// Configurable server options

if (config.server.bypassCORS) {
    logger.info("Adding 'Access-Control-Allow-Origin: *' header to every path.");
    app.use(cors());
}

if (config.server.useHelmet) {
    logger.info("Adding Helmet related headers.");
    app.use(helmet());
}

if (config.server.httpOptionsOK) {
    app.options("/*", function (req, res) {
        logger.info("Bypassing 405 status put by swagger when no request handler is defined");
        return res.sendStatus(200);
    });
}

if (config.server.servePackageInfo) {
    app.use('/api/info', function (req, res) {
        logger.debug("Serving package.json at '%s'", "/api/info");
        res.json(require('./package.json'));
    });
}

// middleware to control when an agreement state process is already in progress
app.use('/api/v2/states/:agreement', middlewares.stateInProgress);
app.use('/api/v3/states/:agreement', middlewares.stateInProgress);
app.use('/api/v4/states/:agreement', middlewares.stateInProgress);
app.use('/api/v5/states/:agreement', middlewares.stateInProgress);
app.use('/api/v6/states/:agreement', middlewares.stateInProgress);

// latest documentation redirection
app.use('/api/latest/docs', function (req, res) {
    res.redirect('/api/' + CURRENT_API_VERSION + '/docs');
});
app.use('/api/latest/api-docs', function (req, res) {
    res.redirect('/api/' + CURRENT_API_VERSION + '/api-docs');
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
        logger.transports.console.level = configurations.loggerLevel;
    }
    logger.info('Trying to deploy server');
    if (configurations) {
        logger.info('Reading configuration...');
        for (var c in configurations) {
            var prop = configurations[c];
            logger.info('Setting property' + c + ' with value ' + prop);
            config.setProperty(c, prop);
        }
    }

    db.connect(function (err) {
        logger.info('Initializing app after db connection');
        if (!err) {
            //list of swagger documents, one for each version of the api.
            var swaggerDocs = [
                swaggerUtils.getSwaggerDoc(1),
                swaggerUtils.getSwaggerDoc(2),
                swaggerUtils.getSwaggerDoc(3),
                swaggerUtils.getSwaggerDoc(4),
                swaggerUtils.getSwaggerDoc(5),
                swaggerUtils.getSwaggerDoc(6)
            ];
            //initialize swagger middleware for each swagger documents.
            swaggerUtils.initializeMiddleware(app, swaggerDocs, function () {

                if (process.env.HTTPS_SERVER === "true" || config.server.listenOnHttps) {
                    https.createServer({
                        key: fs.readFileSync('certs/privkey.pem'),
                        cert: fs.readFileSync('certs/cert.pem')
                    }, app).listen(serverPort, function () {
                        logger.info('HTTPS_SERVER mode');
                        logger.info('Your server is listening on port %d (https://localhost:%d)', serverPort, serverPort);
                        logger.info('Swagger-ui is available on https://localhost:%d/api/%s/docs', serverPort, CURRENT_API_VERSION);
                    });
                } else {
                    http.createServer(app).listen(serverPort, function () {
                        logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
                        logger.info('Swagger-ui is available on http://localhost:%d/api/%s/docs', serverPort, CURRENT_API_VERSION);
                        if (callback) {
                            callback(server);
                        }
                    });
                }
            });
        } else {
            logger.error('Database connection failed', err);
            _undeploy(process.exit(0));
        }
    });
}


/**
 * _undeploy.
 * @param {function} callback callback function
 * @alias module:registry.undeploy
 * */
function _undeploy(callback) {
    if (db) {
        db.close(function () {
            server.close(function () {
                logger.info('Server has been closed');
                callback();
            });
        });
    } else {
        callback();
    }
}