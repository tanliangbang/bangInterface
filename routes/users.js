var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/mysqldb.js');
var utilFn = require('../util/utilFn');

router.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    db.login(username,password,function(err,rows) {
        if (err) {
            console.log(err);
            return;
        }
        if(rows.length<=0){
            utilFn.successSend(res,null,500,'用户名密码错误');
        }else{
            req.session.user = rows[0];
            utilFn.successSend(res,req.session.user,200);
        }
    })
});


router.post('/register', function(req, res, next) {
    var username = req.body.username
    var password = req.body.password
    db.userExistence(username, function(err, rows, fields){
        if (err) {
            utilFn.successSend(res,null,500,'请求失败');
            return;
        }
        if(rows.length>0){
            utilFn.successSend(res,null,511,'该用户已存在');
        }else{
            db.register(username,password, function(err, rows, fields){
                if (err) {
                    console.log(err);
                    return;
                }
                db.query(username,password, function(err, rows, fields){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    {
                        req.session.user = rows[0];
                        utilFn.successSend(res,rows[0],200,'注册成功');
                    }
                });

            });
        }
    });
});




router.post('/changeUserInfo', function(req, res, next) {
    var param = {
        userAavar: req.body.userAavar,
        nick: utilFn.checkEmpty(req.body.nick),
        phone: utilFn.checkEmpty(req.body.phone),
        address: utilFn.checkEmpty(req.body.address),
        job: utilFn.checkEmpty(req.body.job),
        sex: utilFn.checkEmpty(req.body.sex),
        userBreif: utilFn.checkEmpty(req.body.userBreif),
        id: req.session.user.id
    }

    db.changeUserInfo(param, function(err, rows, fields){
        if (err) {
            utilFn.successSend(res,null,500,'请求失败');
            return;
        }
        db.getUserInfoById(param.id, function(err, rows, fields){
            if (err) {
                utilFn.successSend(res,null,500,'请求失败');
                return;
            }
            req.session.user = rows[0];
            utilFn.successSend(res,rows[0],200,'修改成功');
        });
    });
});



router.get('/getUserInfo', function(req, res, next) {
	if(req.session.user===null || req.session.user===undefined){
		utilFn.successSend(res,null,500,'没有登入');
	}else{
		utilFn.successSend(res,req.session.user,200,'成功');
	}
   
});


router.get('/loginOut', function(req, res, next) {
   req.session.user = null;
  utilFn.successSend(res,null,200);
});

module.exports = router;
