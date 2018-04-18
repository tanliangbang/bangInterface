/**
 * Created by funny on 2016/12/7.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/mysqldb');
var utilFn = require('../util/utilFn.js');

var url = require('url');
var async = require('async');

router.post('/comment', function(req, res, next) {
    var from_id = 0;
    if (req.session.user && req.session.user.id) {
        from_id =req.session.user.id;
    }
    var param = {
        topic_id: utilFn.checkNumber(req.body.topic_id),
        content: utilFn.checkEmpty(req.body.content),
        reply_id: utilFn.checkNumber(req.body.reply_id),
        from_uid: from_id,
        to_uid: utilFn.checkNumber(req.body.to_uid),
        type: utilFn.checkNumber(req.body.type),
    }
    db.comment(param, function(err, rows){
        if (err) {
            console.log(err);
            return;
        }
        utilFn.successSend(res,null,200,'评论成功');
    });

});

router.get('/commentList', function(req, res, next) {
    var arg = url.parse(req.url, true).query
    var param = {
        start: arg.start?arg.start:0,
        end: arg.size?arg.size:10,
        topic_id: arg.topic_id,
        reply_id: 0
    }
    if(!param.topic_id){
        utilFn.successSend(res,null,500,'获取失败');
    }

    var list = {};
    db.queryUserComment(param,function(data){
           async.parallel([
                function(callback){
                    queryAllReply(data.list,param.topic_id,function(err){
                        list = data;
                        callback(err);
                        // utilFn.successSend(res,data);
                    })
                },
                function(callback){
                    getAllUserInfo(data.list,function(err){
                        list = data;
                        callback(err);
                    })
                }
            ],
            function(err){
                utilFn.successSend(res,list);
            });
    })

});

function queryAllReply(list,topic_id,callback){
    async.map(list, function(item, callback) {
        db.queryUserComment({reply_id : item.id,topic_id : topic_id},function(data) {
            getAllUserInfo(data.list, function (err) {
                item.reply = data;
                callback(err);
            })
        });
    }, function(err, results) {
        if(err) {
            console.log(err);
        } else {
            callback(err);
        }
    });
}



function getAllUserInfo(list,callback){
    async.map(list, function(item, callback) {
        db.queryAllUserInfo(item,function(err){
            callback(err);
        });
    }, function(err, results) {
        if(err) {
            console.log(err);
        } else {
           callback(err);
        }
    });
}

module.exports = router;
