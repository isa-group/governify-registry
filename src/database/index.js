/*!
governify-registry 3.0.1, built on: 2017-05-08
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

governify-registry is an Open-source software available under the 
GNU General Public License (GPL) version 2 (GPL v2) for non-profit 
applications; for commercial licensing terms, please see README.md 
for any inquiry.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


'use strict';

var config = require('../config');

var jsyaml = require('js-yaml');
var fs = require('fs');
var mongoose = require('mongoose');
var $RefParser = require('json-schema-ref-parser');


/**
 * Database module.
 * @module database
 * @requires config
 * @requires js-yaml
 * @requires fs
 * @requires mongoose
 * @requires json-schema-ref-parser
 * */
module.exports = {
    db: null,
    models: null,
    connect: _connect,
    close: _close
};


/**
 * Create a new database connection.
 * @param {callback} callback callback connect function
 * @alias module:database.connect
 * */
function _connect(callback) {
    var instance = this;
    var databaseURL = config.database.url[config.database.url.length - 1] === "/" ? config.database.url : config.database.url + '/';
    var databaseFullURL = databaseURL + config.database.db_name;
    config.logger.info('Connecting to ' + databaseFullURL);
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseFullURL);
    var db = mongoose.connection;
    db.on('error', function (err) {
        config.logger.error(err);
        if (callback) {
            callback(err);
        }
    });
    db.once('open', function () {
        config.logger.info('Connected to db!');
        instance.db = db;
        if (!instance.models) {
            instance.models = {};
            setupModel(instance, config.models.agreement.name, config.models.agreement.path);
            setupModel(instance, config.models.state.name, config.models.state.path);
        }
        if (callback) {
            callback();
        }

    });
}


/**
 * Close an existing database connection.
 * @param {callback} done callback function when connection closes
 * @alias module:db.close
 * */
function _close(done) {
    var instance = this;
    if (this.db) {
        this.db.close(function (err) {
            instance.db = null;
            done(err);
        });
    }
}


/**
 * Create Mongo schema from JSON schema.
 * @param {Object} instance instance
 * @param {String} modelName model name
 * @param {String} jsonModelUri model URI
 * */
function setupModel(instance, modelName, jsonModelUri) {
    var referencedJsonModel = jsyaml.safeLoad(fs.readFileSync(jsonModelUri));
    $RefParser.dereference(referencedJsonModel, function (err, dereferencedJsonModel) {
        if (err) {
            console.log(err);
        }
        var mongooseSchema = new mongoose.Schema(dereferencedJsonModel, {
            minimize: false
        });
        var mongooseModel = mongoose.model(modelName, mongooseSchema);
        instance.models[modelName] = mongooseModel;
    });
}