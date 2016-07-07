'use strict';
var mongoose = require('mongoose');
var swaggerMongoose = require('swagger-mongoose');
var $RefParser = require('json-schema-ref-parser');
var jsyaml = require('js-yaml');
var fs = require('fs');
var winston = require('winston');

var state = {
    logger: null,
    db: null,
    models: null
};

var configString = fs.readFileSync('./config/config.yaml', 'utf8');
var config = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];


config.parallelProcess.guarantees = process.env.GUARANTEES_PARALLEL_PROCESS ?
                                            process.env.GUARANTEES_PARALLEL_PROCESS : config.parallelProcess.guarantees;

config.parallelProcess.metrics = process.env.METRICS_PARALLEL_PROCESS ?
                                            process.env.METRICS_PARALLEL_PROCESS : config.parallelProcess.metrics;

config.state = state;
module.exports = config;

// Setup logger
winston.emitErrs = true;

var logConfig = {
    levels: {
        error: 7,
        warning: 8,
        agreement: 9,
        ctlAgreement: 9,
        ctlState: 9,
        pricing: 9,
        quotas: 9,
        rates: 9,
        guarantees: 9,
        metrics: 9,
        sm: 9,
        info: 10,
        debug: 11
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
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});
module.exports.stream = {
    write: function(message, encoding) {
        module.exports.logger.info(message);
    }
};

// MongoDB configuration
module.exports.db = {};
module.exports.db.connect = function() {
    if (state.db) return;
    mongoose.connect(config.database.url);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('open', function() {
        state.db = db;
        module.exports.logger.info('Connected to db!');
        if (state.models) return;
        state.models = {};
        setupModel('AgreementModel', './models/agreementModel.json');
        setupModel('StateModel', './models/stateModel.json');
        module.exports.db.models = state.models;
    });
};

module.exports.db.get = function() {
    return state.db;
};

module.exports.db.close = function(done) {
    if (state.db) {
        state.db.close(function(err, result) {
            state.db = null;
            state.mode = null;
        });
    }
};

function setupModel(modelName, jsonModel) {
    var jsonModel = jsyaml.safeLoad(fs.readFileSync(jsonModel));
    $RefParser.dereference(jsonModel, function(err, model) {
        if (err)
            console.log(err);
        var modelSchema = new mongoose.Schema(model, {
            minimize: false
        });
        var Model = mongoose.model(modelName, modelSchema);
        state.models[modelName] = Model;
    });
}
