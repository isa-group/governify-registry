'use strict';
var mongoose = require('mongoose');
var $RefParser = require('json-schema-ref-parser');
var jsyaml = require('js-yaml');
var fs = require('fs');
var winston = require('winston');

/**
 * Confiuration module.
 * @module config
 * @alias module.exports
 */


var configString = fs.readFileSync('./config/config.yaml', 'utf8');
/** Configurarion object initialized with a YAML file. */
var config = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];

config.parallelProcess.guarantees = process.env.GUARANTEES_PARALLEL_PROCESS ? process.env.GUARANTEES_PARALLEL_PROCESS : config.parallelProcess.guarantees;
config.parallelProcess.metrics = process.env.METRICS_PARALLEL_PROCESS ? process.env.METRICS_PARALLEL_PROCESS : config.parallelProcess.metrics;

config.state = {
    logger: null,
    db: null,
    models: null,
    agreementsInProgress: []
};

module.exports = config;

// Setup logger
winston.emitErrs = true;

/**
 * Logger module.
 * @module logger
 */

var logConfig = {
    levels: {
        error: 7,
        warning: 8,
        ctlAgreement: 9,
        ctlState: 9,
        agreement: 10,
        pricing: 10,
        quotas: 10,
        rates: 10,
        guarantees: 10,
        metrics: 10,
        sm: 11,
        streaming: 13,
        info: 12,
        debug: 13
    },
    colors: {
        error: 'red',
        warning: 'yellow',
        agreement: 'magenta',
        ctlAgreement: 'blue',
        ctlState: 'blue',
        pricing: 'green',
        quotas: 'green',
        rates: 'green',
        guarantees: 'green',
        metrics: 'cyan',
        sm: 'grey',
        streaming: 'green',
        info: 'white',
        debug: 'black'
    }
};


/** Create a new logger instance with previous configuration. */
module.exports.logger = new winston.Logger({
    levels: logConfig.levels,
    colors: logConfig.colors,
    transports: [
        new winston.transports.File({
            level: 'debug',
            filename: 'logs.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});

/**
 * Stream module.
 * @module stream
 */
module.exports.stream = {
    /** Print an info message on logger. 
     * @param {string} message message to print
     * @param {string} encoding message enconding
     * @alias module:stream.write
     * */
    write: function (message, encoding) {
        module.exports.logger.info(message);
    }
};

/**
 * Database module.
 * @module db
 */
module.exports.db = {
    /** 
     * Create a new database connection.
     * @param {callback} callback callback connect function
     * @alias module:db.connect
     * */
    connect: function (callback) {
        if (!config.state.db) {
            var databaseURL = config.database.url[config.database.url.length - 1] === "/" ? config.database.url : config.database.url + '/';
            var databaseFullURL = databaseURL + config.database.db_name;
            module.exports.logger.info('Connecting to ' + databaseFullURL);
            mongoose.connect(databaseFullURL);
            var db = mongoose.connection;
            db.on('error', function (err) {
                module.exports.logger.error(err);
                if (callback)
                    callback(err);
            });
            db.on('open', function () {
                config.state.db = db;
                module.exports.logger.info('Connected to db!');
                if (!config.state.models) {
                    config.state.models = {};
                    setupModel(config.models.agreement.name, config.models.agreement.path);
                    setupModel(config.models.state.name, config.models.state.path);
                    module.exports.db.models = config.state.models;
                    if (callback)
                        callback();
                }
            });
        }
    },
    /** 
     * Get existing database connection. 
     * @alias module:db.get
     * */
    get: function () {
        return config.state.db;
    },
    /** 
     * Close existing database connection. 
     * @param {callback} done callback function when connection closes
     * @alias module:db.close
     * */
    close: function (done) {
        if (config.state.db) {
            config.state.db.close(function (err, result) {
                config.state.db = null;
                config.state.models = null;
            });
        }
    }};

/** 
 * Close existing database connection. 
 * @param {string} modelName model name
 * @param {string} jsonModelUri model URI
 * */
function setupModel(modelName, jsonModelUri) {
    var referencedJsonModel = jsyaml.safeLoad(fs.readFileSync(jsonModelUri));
    $RefParser.dereference(referencedJsonModel, function (err, dereferencedJsonModel) {
        if (err)
            console.log(err);
        var mongooseSchema = new mongoose.Schema(dereferencedJsonModel, {
            minimize: false
        });
        var mongooseModel = mongoose.model(modelName, mongooseSchema);
        config.state.models[modelName] = mongooseModel;
    });
}
