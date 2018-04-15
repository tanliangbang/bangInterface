/**
 * Created by funny on 2018/4/5.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var url = require('url');
var utilFn = require('../util/utilFn');
var async = require('async');
var db = require('../db/mysqldb');

router.post('/addPlate', function(req, res) {
        var param = {
            name: req.body.name,
            detail: req.body.detail,
            type: req.body.type
        }
        db.addPlate(param, function(err, rows){
            if (err) {
                return;
            }
            utilFn.successSend(res);
    });
});

router.get('/getPlateList', function(req, res) {
    db.getPlateList(function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res,rows);
    });
});

router.get('/getPlateListAndPlate', function(req, res) {
    db.getPlateList(function(err, rows){
        if (err) {
            return;
        }
        async.map(rows, function(item, callback) {
            db.getResListByPlate(item.id,function(err, rrows){
                item.res = rrows;
                callback(err,item);
            });
        }, function(err, results) {
            if(err) {
                console.log(err);
            } else {
                utilFn.successSend(res,results);
            }
        });

    });
});

router.post('/delPlate', function(req, res) {
    db.delPlate(req.body.id, function(err,rows){
        if (err) {
            return;
        }
        utilFn.successSend(res);
    });
});

router.get('/getPlateDetailById', function(req, res) {
    var arg = url.parse(req.url, true).query
    db.getPlateDetailById(arg.id, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res,rows);
    });
});

router.post('/updatePlate', function(req, res) {
    var param = {
        id:req.body.id,
        name: req.body.name,
        detail: req.body.detail,
        type: req.body.type
    }
    db.updatePlate(param, function(err,rows){
        if (err) {
            return;
        }
        utilFn.successSend(res);
    });
});




module.exports = router;