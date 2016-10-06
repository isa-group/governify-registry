'use strict';

var jsyaml = require('js-yaml');
var fs = require('fs');
var mongoose = require('mongoose');
var $RefParser = require('json-schema-ref-parser');
var config = require('../config');

/**
 * Database module.
 * @module db
 */
module.exports = {
    instance: {
        db: null,
        models: null
    },
    /**
     * Create a new database connection.
     * @param {callback} callback callback connect function
     * @alias module:db.connect
     * */
    connect: function (callback) {
        var instance = this.instance;
        var databaseURL = config.database.url[config.database.url.length - 1] === "/" ? config.database.url : config.database.url + '/';
        var databaseFullURL = databaseURL + config.database.db_name;
        config.logger.info('Connecting to ' + databaseFullURL);
        mongoose.connect(databaseFullURL);
        var db = mongoose.connection;
        db.on('error', function (err) {
            config.logger.error(err);
            if (callback)
                callback(err);
        });
        db.on('open', function () {
            config.logger.info('Connected to db!');
            instance.db = db;

            setupModel(instance, config.models.agreement.name, config.models.agreement.path);
            setupModel(instance, config.models.state.name, config.models.state.path);

            if (callback)
                callback();

        });
    },
    /**
     * Close existing database connection.
     * @param {callback} done callback function when connection closes
     * @alias module:db.close
     * */
    close: function (done) {
        if (this.instance.db) {
            this.instance.db.close(function (err, result) {
                this.instance.db = null;
                this.instance.models = null;
            });
        }
    }
};

/**
 * Create Mongo schema from JSON schema.
 * @param {string} modelName model name
 * @param {string} jsonModelUri model URI
 * */
function setupModel(instance, modelName, jsonModelUri) {
    var referencedJsonModel = jsyaml.safeLoad(fs.readFileSync(jsonModelUri));
    $RefParser.dereference(referencedJsonModel, function (err, dereferencedJsonModel) {
        if (err)
            console.log(err);
        var mongooseSchema = new mongoose.Schema(dereferencedJsonModel, {
            minimize: false
        });
        var mongooseModel = mongoose.model(modelName, mongooseSchema);
        instance[modelName] = mongooseModel;
    });
}
