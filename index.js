'use strict';

/** Server dependencies **/
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
/** Swagger dependencies **/
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
/** Self dependencies **/
var config = require('./config');
var errorModel = require('./errors/index.js').errorModel;
var swaggerUtils = require('./utils/utils').swagger;

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// middleware to control when an agreement state process is already in progress
app.use('/api/v2/states/:agreement', function (req, res, next) {
    config.logger.info('New request to retrieve state for agreement %s', JSON.stringify(req.params.agreement, null, 2));
    if (config.state.agreementsInProgress.indexOf(req.params.agreement) != -1) {
        config.logger.info('Agreement %s status: In-Progress. Ignoring request...', req.params.agreement);
        res.json(new errorModel(202, "Agreement %s status: In-Progress. Try again when the agreement calculation has finished", req.params.agreement));
    } else {
        if (config.statusBouncer) {
            config.state.agreementsInProgress.push(req.params.agreement);
            config.logger.info('Agreement status has been changed to: In-Progress');
        }

        res.on('finish', function () {
            if (config.statusBouncer) {
                config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(req.params.agreement), 1);
                config.logger.info('Agreement status has been changed to: Idle');
            }
        });

        next();
    }
});

// Connect to mongodb
config.db.connect((err) => {

    if (!err) {
        var swaggerDocs = [swaggerUtils.getSwaggerDoc(1), swaggerUtils.getSwaggerDoc(2)]

        swaggerUtils.initializeMiddleware(app, swaggerDocs, function (middleware) {

            var serverPort = process.env.PORT || config.port;
            var server = app.listen(serverPort, function () {
                config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
                config.logger.info('Swagger-ui is available on http://localhost:%d/api/v1/docs', serverPort);
            });
            server.timeout = 24 * 3600 * 1000; // 24h


        });
    }
});

module.exports = app;
