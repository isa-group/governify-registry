'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var config = require('./config');
var bodyParser = require('body-parser');
var cors = require('cors');
var errorModel = require('./errors/index.js').errorModel;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};


// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

// Setup logger
//config.logger.setup();

// Connect to mongodb
config.db.connect();


app.use('/api/v1/states/:agreement', function(req, res, next) {
  config.logger.info('\n\n######################################################################');
  config.logger.info('New request to retrieve state for agreement %s', JSON.stringify(req.params.agreement, null, 2));
  if (config.state.agreementsInProgress.indexOf(req.params.agreement) != -1) {
    config.logger.info('State for agreement %s is already in progress', req.params.agreement);
    res.json(new errorModel(202, "Job in progress: calculating state for agreement " + req.params.agreement));
  } else {
    config.logger.info('Retrieving state for agreement %s', req.params.agreement);
    next();
  }
  config.logger.info('\n######################################################################\n\n');
});


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
  var server = app.listen(serverPort, function() {
    config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    config.logger.info('Swagger-ui is available on http://localhost:%d/api/v1/docs', serverPort);
  });
  server.timeout = 24 * 3600 * 1000; // 24h
});