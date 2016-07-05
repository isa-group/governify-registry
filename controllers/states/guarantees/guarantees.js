'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../../config');
var stateManager = require('../../../stateManager/stateManager.js')
var fs = require('fs');
var errorModel = require('../../../errors/index.js').errorModel;
var logger = config.logger;
var Promise = require("bluebird");

module.exports.guaranteesGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then((manager) => {
        logger.ctlState("Getting state of guarantees...");
        var processGuarantees = [];
        manager.agreement.terms.guarantees.forEach(function(guarantee) {
            processGuarantees.push(manager.get('guarantees', {
                guarantee: guarantee.id
            }));
        });

        Promise.all(processGuarantees).then(function(guaranteesValues) {
            var result = [];
            try {
                guaranteesValues.forEach(function(guaranteeValues) {
                    var res = guaranteeValues.map(function(guaranteeValue) {
                        return manager.current(guaranteeValue);
                    });
                    result = result.concat(res);
                });
                res.json(result);
            } catch (err) {
                logger.error(err);
                res.status(500).json(new errorModel(500, err));
            }
        }, function(err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });

    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}

module.exports.guaranteeIdGET = function(args, res, next) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     **/
    logger.ctlState("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;

    stateManager({
        id: agreementId
    }).then((manager) => {
        manager.get('guarantees', {
            guarantee: guaranteeId
        }).then(function(success) {
            res.json(success.map((element) => {
                return manager.current(element);
            }));
        }, function(err) {
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });
    }, (err) => {
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });
}

module.exports.guaranteeIdPenaltyPOST = function (args, res, next){
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;
    var periods = new getPeriods(query.window, offset);

    console.log(periods);

    stateManager({
      id: agreementId
    }).then((manager) => {

        var resul = [];
        Promise.each(periods, (element)=>{
            var p = {
                from: moment(element.from).subtract(Math.abs(offset), "months").format("YYYY-MM-DD"),
                to: moment(element.to).subtract(Math.abs(offset), "months").format("YYYY-MM-DD")
            };
            return manager.get('guarantees', {
                  guarantee: guaranteeId,
                  scope: query.scope,
                  period: p //,
                //  window: query.window
              }).then(function(success) {
                  var ret = null;
                  success.forEach((e)=>{
                      if(moment(e.period.from).isSameOrAfter(moment(p.from)) && moment(e.period.to).isSameOrBefore(moment(p.to)) )
                        ret = e;
                  });
                  if(ret)
                    resul.push(new penaltyMetric( query.scope, query.parameters, element, manager.current(ret).penalties ));

              }, function(err) {
                  logger.error(err);
//res.status(500).json(new errorModel(500, err));
              });

        }).then((result)=>{
            res.json(resul);
        }, (err)=>{
            logger.error(err);
            res.status(500).json(new errorModel(500, err));
        });

    }, (err)=>{
        logger.error(err);
        res.status(500).json(new errorModel(500, err));
    });


}

var moment = require('moment');

function getPeriods(window, offset){
        var periods = [];
        var Wfrom = moment(window.initial);
        var Wto = moment();
        var from = moment(Wfrom), to = moment(Wfrom).add(1, "months").subtract(1, "days");
        while ( !to || to.isSameOrBefore(Wto) ) {
            periods.push({from: from.format("YYYY-MM-DD"), to: to.format("YYYY-MM-DD")});
            from = moment(from).add(1,"months");
            to = moment(to).add(1, "months");
        }
        return periods;
}

//function
function penaltyMetric (scope, parameters, period, value){
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.value = value;
}
