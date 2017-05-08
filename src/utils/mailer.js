/*!
governify-registry 3.0.0, built on: 2017-05-08
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
var config = require('../config');

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