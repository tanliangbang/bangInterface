/**
 * Created by funny on 2016/12/7.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var url = require('url');
var utilFn = require('../util/utilFn');
var async = require('async');
var db = require('../db/mysqldb');



router.post('/addRes', function(req, res) {
        var param = {
            name: req.body.name.toLowerCase(),
            cname: req.body.cname,
            res_type: req.body.res_type,
            type_specification: req.body.type_specification
        }
        db.addres(param,function(err, rows){
            if (err) {
                console.log(err);
                return;
            }else{
                db.createTable(req, function(err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    utilFn.successSend(res);
                });
            }
        });
});

router.post('/updateRes', function(req, res) {
    var param = {
        name: req.body.name.toLowerCase(),
        cname: req.body.cname,
        res_type: req.body.res_type,
        type_specification: req.body.type_specification,
        id: req.body.id
    }
    var tableName = 'res_content_'+req.body.name.toLowerCase();
    var tempTableName = 'res_content_'+req.body.tempTableName.toLowerCase();
    if(tempTableName===tableName){
        db.updateRes(param, function(err,rows){
            if (err) {
                console.log(err);
                return;
            }
            utilFn.successSend(res);
        });
    }else{
        db.changeTableNameSql(tableName, tempTableName, function(err, rows){
            if (err) {
                console.log(err);
                return;
            }
            db.updateRes(param, function(err,rows){
                if (err) {
                    console.log(err);
                    return;
                }
                utilFn.successSend(res);
            });
        });
    }


});


router.post('/delRes', function(req, res) {
    db.delRes(req, function(err,rows){
        if (err) {
            return;
        }
        utilFn.successSend(res);
    });
});

//查找所有的资源列表
router.get('/getResList', function(req, res, next) {
    var arg = url.parse(req.url, true).query;
    db.getResList(arg.res_type, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res,rows);
    });
});


//通过资源类型查找资源结构列表
router.get('/getResListByType', function(req, res) {
    var arg = url.parse(req.url, true).query
    var type = arg.res_type ? arg.res_type:""
    db.getResListByType(type, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res,rows);
    });
});


router.get('/getRes', function(req, res, next) {
    var arg = url.parse(req.url, true).query
    db.getRes(arg.id, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res,rows);
    });
});



router.post('/addResContent', function(req, res) {
    var param = {}
    param.from_uid = 0;
    if(req.session.user){
        param.from_uid = req.session.user.id
    }
    param.tableName = 'res_content_'+req.body.name.toLowerCase();
    param.startTime = req.body.startTime
    param.endTime = req.body.endTime;
    param.onLine = req.body.onLine
    param.parseContent = JSON.parse(req.body.content);
    if(param.startTime){
        param.startTime = "from_unixtime('"+req.body.startTime+"')"
    }else{
        param.startTime = "null";
    }
    if(param.endTime){
        param.endTime = "from_unixtime('"+req.body.endTime+"')"
    }else{
        param.endTime = "null";
    }

    if(param.parseContent.content){
        var contentParam = {content:param.parseContent.content}
        db.addOrUpdateArticleContent(contentParam, function(err, rows) {
            if (err) {
                return;
            }else{
                param.parseContent.content  = rows.insertId;
                param.parseContent = JSON.stringify(param.parseContent);
                param.parseContent = db.escape(param.parseContent);
                db.addResContent(param, function(err, rows){
                    if (err) {
                        console.log(err)
                    }else{
                        utilFn.successSend(res);
                    }
                });
            }
        });
    }else{
        param.parseContent = JSON.stringify(param.parseContent);
        param.parseContent = db.escape(param.parseContent);
        db.addResContent(param, function(err, rows){
                if (err) {
                    console.log(err)
                }else{
                    utilFn.successSend(res);
                }
            });
    }


});


router.post('/UpdateResContent', function(req, res) {
        var param = {
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            resContentId: req.body.resContentId,
            onLine: req.body.onLine,
            tableName: 'res_content_'+req.body.name.toLowerCase(),
            contentId: parseInt(req.body.contentId),
            parseContent: req.body.content
        }
        async.parallel([
		      function(callback){
		      	  if(param.contentId<=0){
		      	  	callback()
		      	  	return;
		      	  }
                  var content = JSON.parse(param.parseContent).content
                  var contentParam = {content:content,id:param.contentId}
		          db.addOrUpdateArticleContent(contentParam, function(err, rows) {
		          	  callback(err)
		              return;
		          });
		      },
		      function(callback){
		      	if(param.contentId>0){
		      		param.parseContent = JSON.parse(req.body.content);
                    param.parseContent.content  = param.contentId;
                    param.parseContent = JSON.stringify(param.parseContent);
                }
                  param.parseContent = db.escape(param.parseContent)
                  db.updateResContent(param, function(err, rows){
                    callback(err)
                });
		}],function(err){
	          utilFn.successSend(res);
	    });

});

router.get('/getResContentList', function(req, res, next) {
    var arg = url.parse(req.url, true).query
    var start;
    var pageSize;
    if(arg.start){
        start = arg.start;
    }
    if(arg.pageSize){
        pageSize = arg.pageSize;
    }
    var tablename = arg.name.toLowerCase();

    var content ={};
    var pageTotal = 0;
    async.parallel([
            function(callback){
                db.getResContentList(tablename, start, pageSize , function(err,rows) {
                    if (err) {
                        return;
                    }
                    content = utilFn.dealRes(rows)
                    callback(err);
                });
            },
            function(callback){
                db.getResContentListCount(tablename, function(err,rows) {
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

});




router.post('/delResContent', function(req, res) {
    var param = {
        id: req.body.id,
        type: req.body.type
    }
    db.delResContent(param, function(err, rows){
        if (err) {
            return;
        }
        utilFn.successSend(res);
    });
});


router.get('/getResContentById', function(req, res, next) {
    var arg = url.parse(req.url, true).query
    var param = {
        tableName: arg.name.toLowerCase(),
        id: arg.id
    }

    db.getResContentById(param, function(err, rows){
        if (err) {
            return;
        }
        rows[0].content = JSON.parse(rows[0].content);
        var id = 0;
        var detail = rows;
        param.readNum = parseInt(rows[0].readyNum)+1
        if(utilFn.isNumber(rows[0].content.content)){
            id =  parseInt(rows[0].content.content);
            async.parallel([
                    function(callback){
                        db.getArticleContentById(id, function(err, rows) {
                            detail[0].content.content = rows[0].content
                            detail[0].content.contentId = id
                            if (err) {
                                return;
                            }
                            callback(err);
                        });
                    },
                    function(callback){
                        db.addReadNum(param, function(err, rows) {
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
        }else{
            db.addReadNum(param, function(err, rows) {
                if (err) {
                    return;
                }
                utilFn.successSend(res,detail);
            });
        }
    });
});



router.get('/recommend', function(req, res) {
    var arg = url.parse(req.url, true).query
    var param = {
        tableName: arg.name.toLowerCase(),
        size: arg.size
    }
    db.getRecommend(param, function(err, rows){
        if (err) {
            return;
        }
        rows = utilFn.dealRes(rows)
        utilFn.successSend(res,rows);
    });
});


router.get('/readyRank', function(req, res) {
    var arg = url.parse(req.url, true).query
    var param = {
        tableName: arg.name.toLowerCase(),
        size: arg.size
    }
    db.getReadyRank(param, function(err, rows){
        if (err) {
            return;
        }
        rows = utilFn.dealRes(rows)
        utilFn.successSend(res,rows);
    });
});






module.exports = router;
