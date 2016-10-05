'use strict';

module.exports.quotasGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/

    logger.info("New request to GET quotas");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("quotas", function (quotas) {
        res.json(quotas);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}

module.exports.quotasQuotaGET = function (args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * quota (String)
     **/

    logger.info("New request to GET quota");
    var agreementId = args.agreement.value;
    var quotaId = args.quota.value;

    stateManager({
        id: agreementId
    }).get("quotas", {
        id: quotaId
    }, function (quota) {
        res.json(quota);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });

}