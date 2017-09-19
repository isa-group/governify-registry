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