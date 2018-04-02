var mongoose = require('mongoose');
var $RefParser = require('json-schema-ref-parser');
var jsyaml = require('js-yaml');

var config = require('./config');
var logger = config.logger;
config.db.connectSanbox((db)=>{
  setTimeout(()=>{
    var StateModel = config.db.models.StateModel;

    var scope =  {
      activity: "1.1. Actividad de incidencias",
      serviceLine: "1. Linea servicio de mantenimiento básico",
      node: "HUELVA",
      priority: "P1"
    }

    var period = {
        "from" : "2015-12-16T00:00:00.000Z",
        "to" : "2016-01-15T23:59:59.999Z"
    }

    var record = {
        "value" : false,
        "time" : "2016-07-07T14:34:27Z",
        "logsState" : 64061,
        "metrics" : {
            "SPU_IO_K01" : "0.0"
        },
        "evidences" : [
            {
                "id" : "YYYYYYY",
                "issue_start" : null,
                "issue_duration" : "NaN",
                "issue_subject" : "Problema a",
                "issue_end" : "2016-01-15T23:50:52.000Z"
            }
        ],
        "penalties" : {
            "porcentajePTOT" : -5
        }
    }
    var state = {
        "agreementId" : "SPU-T3-1M_v2",
        "stateType": "guarantees",
        "id": "SPU_IO_K01",
        "period" : {
            "from" : "2015-12-16T00:00:00.000Z",
            "to" : "2016-01-15T23:59:59.999Z"
        },
        "scope" : {
            "serviceLine" : "1. Linea servicio de mantenimiento básico",
            "priority" : "P1",
            "node" : "HUELVA",
            "activity" : "1.1. Actividad de incidencias"
        },
        "records" : [
            {
                "value" : false,
                "time" : "2016-07-07T14:34:27Z",
                "logsState" : 64061,
                "metrics" : {
                    "SPU_IO_K01" : "0.0"
                },
                "evidences" : [
                ],
                "penalties" : {
                    "porcentajePTOT" : -5
                }
            }
        ]
    }

    var query =  {
        agreementId : "SPU-T3-1M_v2",
        stateType: "guarantees",
        id: "SPU_IO_K01",
        period: state.period,
        scope: state.scope
    }

    var projection = projectionBuilder("guarantees", query);


    // StateModel.aggregate([
    //   {$match: {agreementId: "SPU_IO-Contract"}},
    //   {$project: projectionBuilder('guarantees', query)}
    // ], (err, result) => {
    //     if(err) console.log(err);
    //     else{
    //       console.log(JSON.stringify(result, null, 2));
    //     }
    // } );

    StateModel.find(projection, (err, result)=>{
      console.log(result);
    })

    StateModel.update(projection, { $push: {"records" : record} },(err, result)=>{
      if(err) console.log(err);
      else {
        console.log("inserta un record: " + JSON.stringify(result, null, 2));
        if(result.nModified === 0){
            var stateModel = new StateModel(state);
            stateModel.save(state, (err, result)=>{
              if(err) console.log(err);
              else {
                console.log("inserta una nueva garantia: " + JSON.stringify(result, null, 2));
              }
            });
        }
      }
    })

  }, 100);

});

// {
//   "agreementId": "SPU-T3-1M_v2",
//   "stateType": "guarantees",
//   "id": "SPU_IO_K01",
//   "period.to": "2016-01-15T23:59:59.999Z",
//   "period.from": "2015-12-16T00:00:00.000Z",
//   "scope.priority": "P1"
// }


function projectionBuilder (stateType, query){
    var singular = {guarantees: "guarantee", metrics: "metric", quotas: "quota", rates: "rate", pricing: "pricing"};
    var projection = {};
    var singularStateType = singular[stateType];
    if(!singularStateType) return logger.error("projectionBuilder error: stateType '%s' is not expected", stateType);

    //iterate over element in the query (scope, period...)
    for(var v in query){
      if(query[v] instanceof Object){
        var queryComponent = query[v];
        //if it is an object we iterate over it (e.g. period.*)
        for(var qC in queryComponent){
          var propValue = null;
          var propName = v + "." + qC;
          propValue = queryComponent[qC];
          if(propValue != '*')
            projection[propName]=propValue;
        }
      }else{
        //if it is not an object we add it directly (e.g. guarantee.guarantee = "K01")
        var propValue = null;
        var propName =  v;
        propValue = query[v];
        if(propValue != '*')
          projection[propName]=propValue;
      }
    }

    logger.sm("Mongo projection: " + JSON.stringify(projection, null, 2));
    return projection;
}


// {$project: {
//     guarantees: { $filter: {
//       input: '$guarantees',
//       as: 'guarantee',
//       cond: {
//         $and: [
//           {$eq: [ "$$guarantee.guarantee", "SPU_IO_K01" ]},
//           {$eq: ["$$guarantee.scope.activity", scope.activity ]},
//           {$eq: ["$$guarantee.scope.priority", scope.priority ]},
//           {$eq: ["$$guarantee.period.to", period.to ]},
//           {$eq: ["$$guarantee.period.from", period.from ]},
//           {$eq:["$$guarantee.scope.node", scope.node ]}
//          ]}
//     }}
// }}

// StateModel.update({agreementId: "SPU_IO-Contract", guarantees:{ $elemMatch : query}}, {$push:{"guarantees.0.records" : record}},(err, result)=>{
//   if(err) console.log(err);
//   else {
//     console.log("inserta un record: " + JSON.stringify(result));
//     if(result.nModified === 0){
//         StateModel.update({agreementId: "SPU_IO-Contract"}, {$push:{"guarantees" : newGuarantee}},(err, result)=>{
//           if(err) console.log(err);
//           else {
//             console.log("inserta una nueva garantia: " + JSON.stringify(result));
//           }
//         });
//     }
//   }
// })
