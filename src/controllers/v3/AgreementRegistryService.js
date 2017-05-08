/*!
governify-registry 0.0.0, built on: 2017-01-01
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/


'use strict';

var agreements = require('./agreements/agreements.js');


/**
 * Agreement service module.
 * @module AgreementRegistryService
 * @see module:agreements
 * @see module:AgreementRegistry
 * @requires agreements
 * */
module.exports = {
    /** agreementsGET. */
    agreementsGET: agreements.agreementsGET,
    /** agreementsDELETE. */
    agreementsDELETE: agreements.agreementsDELETE,
    /** agreementsPOST. */
    agreementsPOST: agreements.agreementsPOST,
    /** agreementIdGET. */
    agreementsAgreementGET: agreements.agreementIdGET,
    /** agreementIdDELETE. */
    agreementsAgreementDELETE: agreements.agreementIdDELETE,
    /** agreementsAgreementTermsGuaranteesGET. */
    agreementsAgreementTermsGuaranteesGET: agreements.agreementsAgreementTermsGuaranteesGET,
    /** agreementsAgreementTermsGuaranteesGuaranteeGET. */
    agreementsAgreementTermsGuaranteesGuaranteeGET: agreements.agreementsAgreementTermsGuaranteesGuaranteeGET
};
