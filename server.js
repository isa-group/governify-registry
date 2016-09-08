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
var optionsV1 = {
  swaggerUi: '/swaggerV1.json',
  controllers: './controllers/v1',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

var optionsV2 = {
  swaggerUi: '/swaggerV2.json',
  controllers: './controllers/v2',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};


// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var specV1 = fs.readFileSync('./api/swaggerV1.yaml', 'utf8');
var swaggerDocV1 = jsyaml.safeLoad(specV1);

var specV2 = fs.readFileSync('./api/swaggerV2.yaml', 'utf8');
var swaggerDocV2 = jsyaml.safeLoad(specV2);

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

/**
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
**/
app.use('/api/v2/states/:agreement', function(req, res, next) {
  config.logger.info('\n\n######################################################################');
  config.logger.info('New request to retrieve state for agreement %s', JSON.stringify(req.params.agreement, null, 2));
  config.logger.warning('Agreements in progress %s', JSON.stringify(config.state.agreementsInProgress, null, 2));
  if (config.state.agreementsInProgress.indexOf(req.params.agreement) != -1) {
    config.logger.info('State for agreement %s is already in progress', req.params.agreement);
    res.json(new errorModel(202, "Job in progress: calculating state for agreement " + req.params.agreement));
  } else {
    config.logger.info('Retrieving state for agreement %s', req.params.agreement);
    if (config.state.statusBouncer)
      config.state.agreementsInProgress.push(req.params.agreement);

    res.on('finish', function() {
      config.logger.warning('Removing agreement from progress list');
      if (config.state.statusBouncer)
        config.state.agreementsInProgress.splice(config.state.agreementsInProgress.indexOf(req.params.agreement), 1);
    });

    next();
  }
  config.logger.info('\n######################################################################\n\n');
});


swaggerTools.initializeMiddleware(swaggerDocV1, function(middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(optionsV1));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi({
    apiDocs: swaggerDocV1.basePath + '/api-docs',
    swaggerUi: swaggerDocV1.basePath + '/docs'
  }));

  // Initialize the Swagger middleware for API V2
  swaggerTools.initializeMiddleware(swaggerDocV2, function(middlewareV2) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middlewareV2.swaggerMetadata());

    // Validate Swagger requests
    app.use(middlewareV2.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middlewareV2.swaggerRouter(optionsV2));

    // Serve the Swagger documents and Swagger UI
    app.use(middlewareV2.swaggerUi({
      apiDocs: swaggerDocV2.basePath + '/api-docs',
      swaggerUi: swaggerDocV2.basePath + '/docs'
    }));

    // Start the server
    var serverPort = process.env.PORT || config.port;
    var server = app.listen(serverPort, function() {
      config.logger.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
      config.logger.info('Swagger-ui is available on http://localhost:%d/api/v1/docs', serverPort);
    });
    server.timeout = 24 * 3600 * 1000; // 24h

  });


});