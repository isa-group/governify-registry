'use strict';

/** Server dependencies **/
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

/** Self dependencies **/
var config = require('./config');
var db = require('./database');
var swaggerUtils = require('./utils/utils').swagger;
var middlewares = require('./utils/utils').middlewares;

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// middleware to control when an agreement state process is already in progress
app.use('/api/v2/states/:agreement', middlewares.stateInProgress);


/**
 * Registry module.
 * @module registry
 * @requires express
 * @requires http
 * @requires body-parser
 * @requires cors
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
 * @param {object} configurations configuration object
 * @param {function} callback callback function
 * @alias module:registry.deploy
 * */
function _deploy(configurations, callback) {
    for (var c in configurations) {
        var prop = configurations[c];
        config.setProperty(c, prop);
    }
    db.connect(function (err) {
        if (!err) {
            //list of swagger documents, one for each version of the api.
            var swaggerDocs = [swaggerUtils.getSwaggerDoc(1), swaggerUtils.getSwaggerDoc(2)];
            //initialize swagger middleware for each swagger documents.
            swaggerUtils.initializeMiddleware(app, swaggerDocs, function (middleware) {

                var serverPort = process.env.PORT || config.port;
                if (!module.exports.server)
                    module.exports.server = http.createServer(app);
                module.exports.server.timeout = 24 * 3600 * 1000; // 24h

                module.exports.server.listen(serverPort, function () {
                    config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
                    config.logger.info('Swagger-ui is available on http://localhost:%d/api/v1/docs', serverPort);
                    if (callback)
                        callback(module.exports.server);
                });
            });
        }
    });
}

/**
 * statesAgreementGET.
 * @param {function} callback callback function
 * @alias module:registry.undeploy
 * */
function _undeploy(callback) {
    db.close(() => {
        module.exports.server.close(() => {
            config.logger.info('Server has been closed');
            callback();
        });
    });
}
