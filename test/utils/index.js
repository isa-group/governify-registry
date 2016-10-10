'use strict';
var mongoose = require('mongoose');
var testConfig = require('../config.json');

module.exports = {
    dropDB: _dropDB
}


function _dropDB(callback) {
    mongoose.connect(testConfig.database.url + "/" + testConfig.database.db_name);
    var connection = mongoose.connection;
    connection.on('error', (err) => {
        if (callback) callback(err);
    });
    connection.once('open', () => {
        try {
            connection.collections['agreementmodels'].drop((err) => {
                if (!err) {
                    try {
                        connection.collections['statemodels'].drop((err) => {
                            if (err) return callback(err);
                            else {
                                connection.close((err) => {
                                    callback();
                                })
                            }
                        });
                    } catch (err) {
                        connection.close((err) => {
                            callback();
                        });
                    }
                } else {
                    return callback(err);
                }
            });
        } catch (e) {
            connection.close((err) => {
                callback();
            });
        }
    });
}
