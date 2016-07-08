var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    auth: {
        api_key: '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'
    }
};

module.exports = nodemailer.createTransport(sgTransport(options));