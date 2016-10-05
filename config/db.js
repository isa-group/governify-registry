//var mongoose = require('mongoose');
//var swaggerMongoose = require('swagger-mongoose');
//var jsyaml = require('js-yaml');
//var fs = require('fs');
//
//var state = {
//    db: null,
//    models: null
//}
//
//// Connect to mongodb
//exports.connect = function(url) {
//    if (state.db) return;
//    if (process.env.NODE_ENV !== 'production') {
//        var options = {
//            user: process.env.DB_USER,
//            pass: process.env.DB_PASSWORD
//        }
//        mongoose.connect(url, options);
//    } else {
//        mongoose.connect(url);
//    }
//
//    var db = mongoose.connection;
//    db.on('error', console.error.bind(console, 'connection error:'));
//    db.on('open', function() {
//        state.db = db;
//        console.log('Connected to db!');
//        if (state.models) return;
//        var swagger = jsyaml.safeLoad(fs.readFileSync('./api/swagger.yaml'));
//        state.models = swaggerMongoose.compile(swagger).models;
//        console.log(state.models);
//    });
//}
//
//exports.get = function() {
//    return state.db
//}
//
//exports.models = state.models;
//
//exports.close = function(done) {
//    if (state.db) {
//        state.db.close(function(err, result) {
//            state.db = null;
//            state.mode = null;
//        })
//    }
//}
