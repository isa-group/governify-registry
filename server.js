'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var config = require('./config');

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};


// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

// Setup logger
config.logger.setup();

// Connect to mongodb
config.db.connect();


// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi({
    apiDocs: swaggerDoc.basePath + '/api-docs',
    swaggerUi: swaggerDoc.basePath + '/docs'
  }));

  // Start the server
  var serverPort = process.env.PORT || config.port;
  app.listen(serverPort, function() {
    config.state.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    config.state.logger.info('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});