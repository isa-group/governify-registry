'use strict';

var fs = require('fs');
var jsyaml = require('js-yaml');
var swaggerTools = require('swagger-tools');

/**
 * Swagger module.
 * @module swagger
 * @see module:utils.swagger
 * @requires fs
 * @requires js-yaml
 * @requires swagger-tools
 * */
module.exports = {
    getRouterOption: _getRouterOption,
    getSwaggerDoc: _getSwaggerDoc,
    initializeMiddleware: _initializeMiddleware
};


/**
 * This method return a the SwaggerRouterOptions object configure with version.
 * @param {Number} version The version of the options required
 * @return {Object} options The object which defines the option that is given to the swagger router component.
 * @alias module:swagger.getRouterOption
 * */
function _getRouterOption(version) {
    return {
        swaggerUi: '/swaggerV' + version + '.json',
        controllers: './controllers/v' + version
    };
}


/**
 * This method return an the object with swagger doc information of the 'version' of the api.
 * @param {Number} version The version of the options required
 * @return {Object} swaggerDoc The object which represent the swagger document.
 * @alias module:swagger.getSwaggerDoc
 * */
function _getSwaggerDoc(version) {
    var spec = fs.readFileSync('./api/swaggerV' + version + '.yaml', 'utf8');
    return jsyaml.safeLoad(spec);
}


/**
 * This add all necessary middlewares from a list of swagger documents.
 * @param {Express} app app to append middlewares
 * @param {Array} swaggerDocs Array of swagger documents
 * @param {Function} callback The callback
 * @return {Express} app for chaining
 * @alias module:swagger.initializeMiddleware
 * */
function _initializeMiddleware(app, swaggerDocs, callback) {
    swaggerDocs.forEach(function (swaggerDoc, index) {
        swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
            // Interpret Swagger resources and attach metadata to request must be first in swagger-tools middleware chain
            app.use(middleware.swaggerMetadata());

            // Validate Swagger requests
            app.use(middleware.swaggerValidator());

            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(module.exports.getRouterOption(index + 1)));

            // Serve the Swagger documents and Swagger UI
            app.use(middleware.swaggerUi({
                apiDocs: swaggerDoc.basePath + '/api-docs',
                swaggerUi: swaggerDoc.basePath + '/docs'
            }));
        });
    });

    if (callback)
        callback(app);
    return app;
}
