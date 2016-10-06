'use strict';
var config = require('./config');

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

// it is necessary to create this object since it is passed to sendGrid transport nodemailer
var options = {
    auth: {
        api_key: config.email.mailerApiKey
    }
};

/**
 * Mailer module.
 * @module mailer
 * @requires config
 * @requires nodemailer
 * @requires nodemailer-sendgrid-transport
 * */

/** Initialize mailer transport with sendgrid credentials.*/
module.exports = nodemailer.createTransport(sgTransport(options));