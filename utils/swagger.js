/** SWAGGER UTILS **/

var fs = require('fs');
var jsyaml = require('js-yaml');
var swaggerTools = require('swagger-tools');

/**
 * This method return a the SwaggerRouterOptions object configure with version.
 *
 * Examples:
 *
 *    var options  = getRouterOption(1);
 *
 * @param {Number} version - The version of the options required
 *
 * @return {Object} options The object which defines the option that is given to the swagger router component.
 * @api public
 */
module.exports.getRouterOption = function (version) {
    return {
        swaggerUi: '/swaggerV' + version + '.json',
        controllers: './controllers/v' + version,
    };
}

/**
 * This method return an the object with swagger doc information of the 'version' of the api.
 *
 * Examples:
 *
 *    var swaggerDoc  = getSwaggerDoc(version)
 *
 * @param {Number} version - The version of the options required
 *
 * @return {Object} swaggerDoc The object which represent the swagger document.
 * @api public
 */
module.exports.getSwaggerDoc = function (version) {
    var spec = fs.readFileSync('./api/swaggerV' + version + '.yaml', 'utf8');
    return jsyaml.safeLoad(spec);
}

/**
 * This added all necesary middlewares from a list of swagger documents.
 *
 * Examples:
 *
 *   initializeMiddleware(app, [swagger1, swagger2], callback)
 *
 * @param {Express} app - app to append middlewares
 * @param {Array} swaggerDocs - Array of swagger documents
 * @param {Function} callback - The callback
 *
 * @return {Express} app for chaining
 * @api public
 */
module.exports.initializeMiddleware = function (app, swaggerDocs, callback) {

    swaggerDocs.forEach((swaggerDoc, index) => {
        swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
            // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
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

    if (callback) callback(app);
    return app;
}
