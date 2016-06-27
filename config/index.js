'use strict'
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
}

var configString = fs.readFileSync('./config/config.yaml', 'utf8');
var config = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];
config.state = state;
module.exports = config;

// Setup logger
module.exports.logger = {};
module.exports.logger.setup = function() {
    if (state.logger) return;
    if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs');
    }
    if (process.env.NODE_ENV !== 'production') {
        state.logger = new(winston.Logger)({
            transports: [
                new(winston.transports.Console)(),
                new(winston.transports.File)({
                    filename: config.logfile
                })
            ]
        });
        state.logger.transports.console.timestamp = true;
    } else {
        state.logger = new(winston.Logger)({
            transports: [
                new(winston.transports.File)({
                    filename: config.logfile
                })
            ]
        });
    }
}

// MongoDB configuration
module.exports.db = {};
module.exports.db.connect = function() {
    if (state.db) return;
    mongoose.connect(config.database.url);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('open', function() {
        state.db = db;
        state.logger.info('Connected to db!');
        if (state.models) return;
        state.models = {};
        setupModel('AgreementModel', './models/agreementModel.json');
        setupModel('StateModel', './models/stateModel.json');
        module.exports.db.models = state.models;
    });
}

module.exports.db.get = function() {
    return state.db
}

module.exports.db.close = function(done) {
    if (state.db) {
        state.db.close(function(err, result) {
            state.db = null;
            state.mode = null;
        })
    }
}

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
