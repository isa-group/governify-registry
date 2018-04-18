/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2018 ISA group
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

/**
 * @module utils.scopes
 */
module.exports = {
    /**
     * @function 
     * @param
     */
    registryToComputerParser: _registryToComputerParser,

    /**
     * @function 
     * @param
     */
    computerToRegistryParser: _computerToRegistryParser
};

function _computerToRegistryParser(computerScope, mapping) {
    var mappedScope = {};
    //reversing mapping
    var mappingReversed = {};
    for (var field in mapping) {
        mappingReversed[mapping[field]] = field;
    }

    for (var scopeField in computerScope) {
        var mappedScopeField = mappingReversed[scopeField];

        if (mappingReversed && mappedScopeField) {
            mappedScope[mappedScopeField] = computerScope[scopeField];
        } else {
            mappedScope[scopeField] = computerScope[scopeField];
        }
    }

    return mappedScope;
}

function _registryToComputerParser(queryScope, mapping) {
    var mappedScope = {};

    for (var scopeField in queryScope) {
        var mappedScopeField = mapping[scopeField];

        if (mapping && mappedScopeField) {
            mappedScope[mappedScopeField] = queryScope[scopeField];
        } else {
            mappedScope[scopeField] = queryScope[scopeField];
        }
    }

    return mappedScope;
}