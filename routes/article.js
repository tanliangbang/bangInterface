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

router.post('/addOrUpdateArticle', function(req, res) {
    var user = req.session.user;
    var community = req.body.community?parseInt(req.body.community):0;
    if (!user || !user.id) {
        utilFn.successSend(res,null,500,'没有登入');
        return;
    }
    if (community === 1 && req.session.user.username !== "tanliangbang") {
        utilFn.successSend(res,null,500,'用户没有权限');
        return;
    }
    var param = {
        id:req.body.id,
        title: req.body.title,
        breif: req.body.breif,
        wherefrom: req.body.wherefrom?req.body.wherefrom:'',
        imgUrl: req.body.imgUrl?req.body.imgUrl:'',
        is_show: req.body.is_show?req.body.is_show: 1,
        typeId: req.body.typeId,
        typeName: req.body.typeName,
        content: req.body.content,
        label: req.body.label?req.body.label:'',
        auth: user.id,
        contentId:req.body.contentId,
        oldTypeId:req.body.oldTypeId,
        is_community:community
    }
    db.addOrUpdateArticleContent(param, function(err, rows) {
        if (err) {
            return;
        }else{
            param.content = param.contentId?param.contentId:rows.insertId;
            async.parallel([
                    function(callback){
                        db.addOrUpdateArticle(param, function(err){
                            callback()
                        });
                    },
                    function(callback){
                        db.changeTypeNum(param,function(){
                            callback()
                        })
                    }],
                function(err,results){
                    utilFn.successSend(res);
                });

        }
    });

});


router.get('/getArticleListByType', function(req, res) {
    var arg = url.parse(req.url, true).query
    var param = {
        start:arg.start,
        pageSize:arg.pageSize,
        typeId:arg.typeId,
        community:arg.community,
        good:arg.good,
        recommend:arg.recommend
    }
    var content ={};
    var pageTotal = 0;
    async.parallel([
            function(callback){
                db.getReArticleListByType(param, function(err,rows) {
                    if (err) {
                        return;
                    }
                    content = utilFn.dealRes(rows);
                    callback(err);

                });
            },
            function(callback){
                db.getArticleListByTypeCount(param, function(err,rows) {
                    if (err) {
                        return;
                    }
                    pageTotal = rows[0].total;
                    callback(err);
                });
            }],
        function(err){
            var data={content:content,pageTotal:pageTotal}
            utilFn.successSend(res,data);
        });
})

router.get('/getArticleById', function(req, res, next) {
    var id = url.parse(req.url, true).query.id
    db.getArticlById(id, function(err, rows){
        if (err) {
            return;
        }
        var contentId = parseInt(rows[0].content);
        var detail = rows;
            async.parallel([
                    function(callback){
                        db.getArticleContentById(contentId, function(err, rows) {
                            if(rows[0]){
                                detail[0].content = rows[0].content
                                detail[0].contentId = contentId
                            }
                            if (err) {
                                return;
                            }
                            callback(err);
                        });
                    },
                    function(callback){
                        var ready_num = parseInt(detail[0]['ready_num'])+1;
                        db.updateArticlReadyById(ready_num,id, function(err, rows) {
                            if (err) {
                                return;
                            }
                            callback(err);
                        });
                    }
                ],
                function(err){
                    utilFn.successSend(res,detail);
                });
    });
});

router.post('/operaArticle', function(req, res) {
    var param = {
        num:req.body.num,
        id: req.body.id,
        opera:req.body.opera
    }
    db.artOpera(param, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res);
    });
});

router.get('/changeDate', function(req, res) {
    db.changeDate({}, function(err, rows){
        utilFn.successSend(res);
    });
});

router.post('/like', function(req, res) {
    var id = req.body.id
    db.like(id, function(err, rows){
        utilFn.successSend(res);
    });
});




module.exports = router;