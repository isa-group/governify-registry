/*!
governify-registry 0.0.1, built on: 2017-01-30
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';
var mongoose = require('mongoose');
var testConfig = require('../config.json');
var Ajv = require('ajv');
var ajv = new Ajv({unknownFormats: ['int32', 'int64', 'float', 'double', 'byte', 'binary', 'date', 'date-time', 'password']});

module.exports = {
    dropDB: _dropDB,
    orderByCenterAndId: _orderByCenterAndId,
    stateEqual: _stateEqual,
    arrayEqual: _arrayEqual,
    validateModel: _validateModel
};


function _dropDB(callback) {
    mongoose.connect(testConfig.database.url + "/" + testConfig.database.db_name);
    var connection = mongoose.connection;
    connection.on('error', (err) => {
        if (callback)
            callback(err);
    });
    connection.once('open', () => {
        try {
            connection.db.dropDatabase((err) => {
                if (!err) {
                    connection.close((err) => {
                        callback();
                    });
                } else {
                    connection.close((err) => {
                        callback(err);
                    });
                }
            });
        } catch (e) {
            connection.close((err) => {
                callback();
            });
        }
    });
}

function _orderByCenterAndId(a, b) {
    if (a.scope.center > b.scope.center)
        return 1;
    if (a.scope.center < b.scope.center)
        return -1;
    if (a.scope.center === b.scope.center) {
        if (a.id > b.id)
            return 1;
        else
            return -1;
    }
}


function _stateEqual(state1, state2) {
    var ret = true;

    ret = ret && (state1.agreementId === state2.agreementId && state1.stateType === state2.stateType && state1.id === state2.id);

    //scope equal
    for (var vs1 in state1.scope) {
        var vars1 = state1.scope[vs1];
        ret = ret && (vars1 === state2.scope[vs1]);
    }

    for (var vs2 in state2.scope) {
        var vars2 = state2.scope[vs2];
        ret = ret && (vars2 === state1.scope[vs2]);
    }

    //period equal
    for (var vs1 in state1.period) {
        var vars1 = state1.period[vs1];
        ret = ret && (vars1 === state2.period[vs1]);
    }

    for (var vs2 in state2.period) {
        var vars2 = state2.period[vs2];
        ret = ret && (vars2 === state1.period[vs2]);
    }

    //values
    ret = ret && (state1.value === state2.value);

    //penalties
    try {

        for (var vs1 in state1.penalties) {
            var vars1 = state1.penalties[vs1];
            ret = ret && (vars1 === state2.penalties[vs1]);
        }

        for (var vs2 in state2.penalties) {
            var vars2 = state2.penalties[vs2];
            ret = ret && (vars2 === state1.penalties[vs2]);
        }

    } catch (e) {
        ret = ret && false;
    }

    return ret;
}

function _arrayEqual(array1, array2) {
    var ret = true;
    //all element of array1 is on array2
    array1.forEach((elementArray1) => {
        var elementOnArray2 = array2.filter((elementArray2) => {
            return _stateEqual(elementArray1, elementArray2);
        });

        ret = ret && elementOnArray2.length === 1;
    });

    //all element of array2 is on array1
    array2.forEach((elementArray2) => {
        var elementOnArray1 = array1.filter((elementArray1) => {
            return _stateEqual(elementArray2, elementArray1);
        });

        ret = ret && elementOnArray1.length === 1;
    });

    return ret;
}

function _validateModel(model, schema) {
    let isValidModel = ajv.validate(schema, model);
    if (!isValidModel) {
        console.log(ajv.errors);
    }
    return isValidModel;
}
;
