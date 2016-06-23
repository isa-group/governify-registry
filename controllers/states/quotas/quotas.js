'use strict';

module.exports.quotasGET = function (args, res, next){
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    res.send("Get all quota states");

}

module.exports.quotasQuotaGET = function (args, res, next){
    /**
     * parameters expected in the args:
     * agreement (String)
     * quota (String)
     **/

     res.send("Get " + args.quota.value +" states");

}
