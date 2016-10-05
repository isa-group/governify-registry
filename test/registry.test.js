'use strict';

var expect      = require('chai').expect,
    request     = require('request'),
    ppinot      = require('./expected/ppinotData'),
    registry    = require('../index'),
    agreement   = require('./expected/agreements');

describe("Integration TEST", function() {
    before( (done) => {
        ppinot.listen(5000, ()=>{
            registry.listen(5001, () =>{
              setTimeout(()=>{
                  request.post({url: 'http://localhost:5001/api/v2/agreements', body: agreement, json: true}, (err, res, body)=>{
                      if(!err){
                          console.log(body);
                      }else{
                          console.log(err);
                      }
                      done();
                  });
              }, 1000);
            });
        });
    });
    after( () =>{

    })

    it('Guarantees request')
});
/** REQUESTS **/

/**
  *  GET /api/v2/states/T14-L4-S12-minimal/guarantees
  */


/**
  *  POST /api/v2/states/T14-L4-S12-minimal/metrics/SPU_IO_K00
  *   {
  *	    "scope": {
  *		     "priority" : "P1", ["P1", "P2", "P3"]
  *		     "node": "*",
  *		     "center": "*",
  *		     "serviceLine": "",
  *		     "activity": ""
  *	    },
  *	    "window": {
  *		     "type": "static",
  *		     "period": "monthly",
  *		     "initial": "2014-10-16T22:00:00.000Z",
  *		     "timeZone": "Europe/Madrid"
  *	    },
  *	    "logs":{
  *		     "casdm":"http://logs-devel.sas.governify.io/api/v1/ca-sdm/v10.13"
  *	    }
  *   }
  */
