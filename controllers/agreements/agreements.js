'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../config');
var agreementManager = require('governify-agreement-manager').operations.states;

var agreementState = require('../states/agreements/agreements');
var stateRegistySrv = require('../StateRegistryService');

var fs = require('fs');
var errorModel = require('../../errors/index.js').errorModel;
var logger = config.logger;

module.exports = {
  agreementsPOST: _agreementsPOST,
  agreementsDELETE: _agreementsDELETE,
  agreementsGET: _agreementsGET,
  agreementIdGET: _agreementIdGET,
  agreementIdDELETE: _agreementIdDELETE
}

function _agreementsGET(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   **/
  logger.info("New request to GET agreements agreements/agreements.js");
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find(function(err, agreements) {
    if (err) {
      logger.error(err.toString());
      return res.json(new errorModel(500, err));
    }
    logger.info("Agreements returned");
    return res.json(agreements);
  });
}


function _agreementsDELETE(args, res, next) {
  logger.info("New request to DELETE all agreements");
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.remove({}, function(err) {
    if (!err) {
      logger.info("Deleted all agreements");
      stateRegistySrv.statesDELETE(args, res, next);
    } else {
      res.sendStatus(404);
      logger.warning("Can't delete all agreements: " + err);
    }
  });

}

function _agreementIdGET(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
  logger.info("New request to GET agreement with id = " + args.agreement.value);
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.findOne({
    id: args.agreement.value
  }, function(err, agreement) {
    if (err) {
      logger.error(err.toString());
      return res.status(500).json(new errorModel(500, err));
    }

    if (!agreement) {
      logger.error('There is no agreement with id: ' + args.agreement.value);
      return res.status(404).json(new errorModel(404, 'There is no agreement with id: ' + args.agreement.value));
    }

    logger.info("Agreement returned");
    res.json(agreement);
  });
}

function _agreementIdDELETE(args, res, next) {
  logger.info("New request to DELETE agreement");
  var agreementId = args.agreement.value;
  if (agreementId) {
    var AgreementModel = config.db.models.AgreementModel;
    AgreementModel.findOneAndRemove({
      id: agreementId
    }, function(err) {
      if (!err) {
        logger.info("Deleted agreement with id " + agreementId);
        agreementState.agreementIdDELETE(args, res, next);
      } else {
        res.sendStatus(404);
        logger.warning("Can't delete agreement with id " + agreementId);
      }
    });
  } else {
    res.sendStatus(400);
    logger.warning("Can't delete agreement with id " + agreementId);
  }
}


function _agreementsPOST(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (Agreement)
   **/
  // no response value expected for this operation

  //console.log(config.db.models.agreement);

  $RefParser.dereference(args.agreement.value, function(err, schema) {
    logger.info("New request to CREATE agreement with id = %s", schema.id);
    if (err) {
      logger.error(err.toString());
      res.json(new errorModel(500, err));
    } else {
      var Agreement = config.db.models.AgreementModel;
      Agreement.findOne({id: schema.id}, (err, result) => {
          if(err){
              logger.error("Mongo error finding agreement: " + err.toString());
              res.json(new errorModel(500, "Mongo error finding agreement" + err.toString()));
          }else{
              if(result){
                  logger.warning("Agreement already exists");
                  res.json(new errorModel(403, "Agreement already exists"));
              }else{
                  var agreement = new config.db.models.AgreementModel(schema);
                  agreement.save((err, result)=>{
                      if(err){
                          logger.error("Mongo error saving agreement: " + err.toString());
                          res.json(new errorModel(500, "Mongo error saving agreement: " + err.toString()));
                      }else{
                          logger.info('New agreement saved successfully!');
                          res.json({
                            code: 200,
                            message: 'New agreement saved successfully!',
                            data: schema
                          });
                      }
                  });
              }
          }
      });
    }
  });
}
