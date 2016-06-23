'use strict';

module.exports.ratesGET = function (args, res, next){
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    res.send("Get all rate states");

}

module.exports.ratesRateGET = function (args, res, next){
    /**
     * parameters expected in the args:
     * agreement (String)
     * rate (String)
     **/

     res.send("Get " + args.rate.value +" states");

}
