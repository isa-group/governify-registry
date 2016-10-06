'use strict';
/** Server dependencies **/
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
/** Swagger dependencies **/
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
/** Self dependencies **/
var config = require('./config');
var db = require('./database');
var errorModel = require('./errors').errorModel;
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

// Connect to mongodb
db.connect((err) => {

    if (!err) {
        //list of swagger documents, one for each version of the api.
        var swaggerDocs = [swaggerUtils.getSwaggerDoc(1), swaggerUtils.getSwaggerDoc(2)]
            //initialize swagger middleware for each swagger documents.
        swaggerUtils.initializeMiddleware(app, swaggerDocs, function (middleware) {

            var serverPort = process.env.PORT || config.port;

            var server = http.createServer(app);
            server.timeout = 24 * 3600 * 1000; // 24h

            server.listen(serverPort, function () {
                config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
                config.logger.info('Swagger-ui is available on http://localhost:%d/api/v1/docs', serverPort);
            });

        });
    }
});

module.exports = app;
