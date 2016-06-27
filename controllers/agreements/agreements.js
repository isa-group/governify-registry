'use strict';

var jsyaml = require('js-yaml');
var $RefParser = require('json-schema-ref-parser');
var config = require('../../config');
var stateManager = require('governify-agreement-manager').operations.states;

var fs = require('fs');
var errorModel = require('../../errors/index.js').errorModel;
var logger = config.state.logger;

module.exports = {
  agreementsPOST: _agreementsPOST,
  agreementsGET: _agreementsGET,
  agreementIdGET: _agreementIdGET
}

function _agreementsGET(args, res, next) {
  /**
   * parameters expected in the args:
   * namespace (String)
   **/
  logger.info("New request to GET agreements");
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find(function(err, agreements) {
    if (err) {
      logger.error(err.toString());
      res.json( new errorModel(500, err ));
    }
    logger.info("Agreements returned");
    res.json(agreements);
  });

}

function _agreementIdGET(args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (String)
   **/
  logger.info("New request to GET agreement with id = " + args.agreement.value);
  var AgreementModel = config.db.models.AgreementModel;
  AgreementModel.find({
    'id': args.agreement.value
  }, function(err, agreement) {
    if (err) {
      logger.error(err.toString());
      res.json( new errorModel(500, err ));
    }
    logger.info("Agreement returned");
    res.json(agreement);
  });

}


function _agreementsPOST (args, res, next) {
  /**
   * parameters expected in the args:
   * agreement (Agreement)
   **/
  // no response value expected for this operation

  //console.log(config.db.models.agreement);
  logger.info("New request to CREATE agreement");
  $RefParser.dereference(args.agreement.value, function(err, schema) {
    if (err) {
      logger.error(err.toString());
      res.json( new errorModel(500, err ));
    } else {
      var agreement = new config.db.models.AgreementModel(args.agreement.value);
      agreement.save(function(err, agModel) {
        if (err) {
          logger.error("Mongo error saving agreement: " + err.toString());
          res.json(new errorModel(500, err ));
        } else {
          logger.info('New agreement saved successfully!');
          logger.info('Initializing agreement state');
          //Initialize state
          stateManager.initializeState(agModel, (st) =>{
              var state = new config.db.models.StateModel(
                st
              );
              state.save((err) => {
                  if(err){
                    logger.error("Mongo error saving state: " + err.toString());
                    res.json( new errorModel(500, err ));
                  }else{
                    logger.info("State initialized successfully!: ");
                    res.json({
                      code: 200,
                      message: 'New agreement saved successfully!',
                      data: agreement
                    });
                  }
              });
          }, (err) =>{
              logger.error("Mongo error saving state: " + err.toString());
              res.json(new errorModel(500, err ));
          });


        }
      });
    }
  });
}
