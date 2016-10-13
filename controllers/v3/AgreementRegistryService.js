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
