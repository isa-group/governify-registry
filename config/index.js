'use strict';
var mongoose = require('mongoose');
var $RefParser = require('json-schema-ref-parser');
var jsyaml = require('js-yaml');
var fs = require('fs');
var winston = require('winston');

var state = {
    logger: null,
    db: null,
    models: null,
    agreementsInProgress: []
};

var configString = fs.readFileSync('./config/config.yaml', 'utf8');
var config = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];

config.parallelProcess.guarantees = process.env.GUARANTEES_PARALLEL_PROCESS ? process.env.GUARANTEES_PARALLEL_PROCESS : config.parallelProcess.guarantees;
config.parallelProcess.metrics = process.env.METRICS_PARALLEL_PROCESS ? process.env.METRICS_PARALLEL_PROCESS : config.parallelProcess.metrics;

config.state = state;
module.exports = config;

// Setup logger
winston.emitErrs = true;

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
module.exports.stream = {
    write: function (message, encoding) {
        module.exports.logger.info(message);
    }
};

// MongoDB configuration
module.exports.db = {};
module.exports.db.connect = function () {
    if (!state.db) {
        var url = config.database.url[config.database.url.length - 1] === "/" ? config.database.url : config.database.url + '/';
        mongoose.connect(url + config.database.db_name);
        mongoose.connect(config.database.url);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.on('open', function () {
            state.db = db;
            module.exports.logger.info('Connected to db!');
            if (!state.models) {
                state.models = {};
                setupModel(config.models.agreement.name, config.models.agreement.path);
                setupModel(config.models.state.name, config.models.state.path);
                module.exports.db.models = state.models;
            }
        });
    }
};

module.exports.db.get = function () {
    return state.db;
};

module.exports.db.close = function (done) {
    if (state.db) {
        state.db.close(function (err, result) {
            state.db = null;
            state.models = null;
        });
    }
};

function setupModel(modelName, jsonModelUri) {
    var referencedJsonModel = jsyaml.safeLoad(fs.readFileSync(jsonModelUri));
    $RefParser.dereference(referencedJsonModel, function (err, dereferencedJsonModel) {
        if (err)
            console.log(err);
        var mongooseSchema = new mongoose.Schema(dereferencedJsonModel, {
            minimize: false
        });
        var mongooseModel = mongoose.model(modelName, mongooseSchema);
        state.models[modelName] = mongooseModel;
    });
}
