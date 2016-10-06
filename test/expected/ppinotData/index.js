'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),

    app = express();


app.use(bodyParser.json());

app.post('/api/v1/indicators/:name', (req, res, next) => {

    res.json(require('./' + req.params.name + '_' + (req.body.scope.priority || req.body.scope.nodeETC.replace('>=', 'GT').replace('<', 'LT').replace(' ', ''))));

});

app.get('/count', (req, res, next) => {

    res.json(23);

});

module.exports = app;

//app.listen(5000, ()=>{console.log("ready")});
