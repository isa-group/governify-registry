'use strict';

module.exports.ratesGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    logger.info("New request to GET rates");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("rates", function (rates) {
        res.json(rates);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}

module.exports.ratesRateGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * rate (String)
     **/

    logger.info("New request to GET rate");
    var agreementId = args.agreement.value;
    var rateId = args.rate.value;

    stateManager({
        id: agreementId
    }).get("rates", {
        id: rateId
    }, function (rate) {
        res.json(rate);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}