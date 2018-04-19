var mysql = require('mysql');
var async = require('async');

var mysqldb = {};
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'tanliangbang',
    database        : 'bangbang_web',
    charset: 'UTF8_GENERAL_CI'
});


mysqldb.query = function(sql, callback){
    if (!sql) {
        callback();
        return;
    }
    try {
        pool.query(sql, function(err, rows, fields) {
            if (err) {
                callback(err, null);
                return;
            };
            callback(null, rows, fields);
        });
    } catch (err) {
        console.log(err)
    }

};

//---------------------------------------------model接口实现----------------------------------------------------------

mysqldb.addPlate = function(param, callback) {
    var sql = "insert into plate (name,detail,type) values "+
        "('"+param.name+"','"+param.detail+"','"+param.type+"')";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getPlateList = function(callback) {
    var sql = "select * from plate";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getPlateDetailById = function(id, callback) {
    var sql = "select * from plate where id =" + id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.delPlate = function(id, callback) {
    var sql = "delete from plate where id ="+ id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.updatePlate = function (param, callback) {
    var sql = "update plate set name='"+param.name+"',detail='"+param.detail+"',type='"+param.type+ "' where id = " + param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

//---------------------------------------------article接口实现----------------------------------------------------------
mysqldb.addOrUpdateArticle = function(param, callback) {
    var sql = ""
    if(param.id) {
        sql = "update article set title = '" + param.title +"',breif='"+param.breif+"',wherefrom='"+param.wherefrom+
            "',content="+param.content+",is_show="+param.is_show+",typeId="+param.typeId+
            ",label='"+param.label+"',imgUrl='"+param.imgUrl+"',is_community="+param.is_community+",typeName='"+param.typeName+"',modifiedTime = now() where id = "+ param.id
    }else {
        sql =  "insert into article (title,breif,wherefrom,content,auth,is_show,typeId,label,imgUrl,is_community,typeName,createTime) values ('"+
            param.title+"','"+param.breif+"','"+param.wherefrom+"',"+ param.content+","+ param.auth+","+ param.is_show+","+
            param.typeId+",'"+ param.label+"','"+ param.imgUrl+"',"+param.is_community+",'"+ param.typeName+"',now())";
    }
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}



mysqldb.getReArticleListByType = function(param, callback) {
    var str = " where 1=1 ";
    if(param.typeId){
        str += " and art.typeId = "+param.typeId
    }
    if(param.community){
        str += " and art.is_community = " + param.community
    }else {
        str += " and art.is_community = 0"
    }
    if (param.good) {
        str += " and art.is_good = " + param.good
    }
    if (param.recommend) {
        str += " and art.is_recommend = " + param.recommend
    }

    if (param.top) {
        str += " and art.is_top = " + param.top
    }

    if (param.show) {
        str += " and art.is_show = " + param.show
    }

    str += ' order by art.createTime desc '
    if(param.start && param.pageSize){
        str += ' limit '+param.start+','+param.pageSize
    }
    var sql = "select art.*, user.username, user.nick, user.userAavar, user.job from article as art left join " +
        "bang_users user on art.auth = user.id " + str
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getArticleListByTypeCount = function(param, callback) {
    var str = " where 1=1 ";
    if(param.typeId){
        str += " and typeId = "+param.typeId
    }
    if(param.community){
        str += " and is_community = " + param.community
    }else {
        str += " and is_community = 0"
    }

    if (param.good) {
        str += " and is_good = " + param.good
    }
    if (param.recommend) {
        str += " and is_recommend = " + param.recommend
    }

    if (param.top) {
        str += " and is_top = " + param.top
    }

    if (param.show) {
        str += " and is_show = " + param.show
    }


    var sql = "select count(id) as total from article" + str
    console.log(sql)
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getArticlById = function(id, callback) {
    var sql = "select art.*, user.username, user.nick, user.userAavar, user.job from article as art left join " +
        "bang_users user on art.auth = user.id  where art.id = " + id
    console.log(sql)
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.updateArticlReadyById = function(num,id, callback) {
    var sql = "update article set ready_num = "+num+" where id = "+id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

//文章推荐
mysqldb.artOpera = function(param, callback) {
    var sql = "";
    switch (param.opera){
        case 'top':
            sql = "update article set is_top = "+param.num+" where id = "+ param.id;
            break;
        case 'show':
            sql = "update article set is_show = "+param.num+" where id = "+ param.id;
            break;
        case 'recommend':
            sql = "update article set is_recommend = "+param.num+" where id = "+ param.id;
            break;
        case 'good':
            sql = "update article set is_good = "+param.num+" where id = "+ param.id;
            break;
        case 'pass':
            sql = "update article set is_pass = "+param.num+" where id = "+ param.id;
            break;
    }
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}


mysqldb.changeTypeNum = function(param,callback) {
    var sql = "select * from res_content_article_type where id = "+ param.typeId;
    var num = 0;
    var _this = this;
    if (param.typeId === param.oldTypeId) {
        callback()
        return;
    }
    console.log(param['is_community'])
    this.query(sql, function(err, rows){
        async.parallel([
                function(callback){
                    var contentObj = JSON.parse(rows[0].content);
                    if(param['is_community']===1){
                        num = parseInt(contentObj.sys_community_num)+1
                        contentObj.sys_community_num = num
                    } else{
                        num = parseInt(contentObj.sys_article_num)+1
                        contentObj.sys_article_num = num
                    }
                    contentObj = JSON.stringify(contentObj)
                    var updateSql = "update res_content_article_type set content = '"+ contentObj +"' where id = " +param.typeId;
                    _this.query(updateSql, function(err, rows){
                        callback()
                    })
                },
                function(callback){
                    if(param.oldTypeId){
                        var oldSql = "select * from res_content_article_type where id = "+ param.oldTypeId;
                        _this.query(oldSql, function(err, rows){
                            var contentObj = JSON.parse(rows[0].content);
                            if(param['is_community']===1){
                                num = parseInt(contentObj.sys_community_num)-1
                                contentObj.sys_community_num = num
                            }else {
                                num = parseInt(contentObj.sys_article_num)-1
                                contentObj.sys_article_num = num
                            }
                            contentObj = JSON.stringify(contentObj)
                            var updateSql = "update res_content_article_type set content = '"+ contentObj +"' where id = " +param.oldTypeId;
                            _this.query(updateSql, function(err, rows){
                                callback()
                            })
                        })
                    }else {
                        callback()
                    }
                }],
            function(err){
                callback(err);
            });
    });
}



mysqldb.changeDate = function (param, callback){
    sql = "select * from res_content_goodarticles";
    this.query(sql, function(err, rows){
        for(var i=0;i<rows.length;i++){
            var obj={}
            var content = JSON.parse(rows[i].content)
            obj.title = content.title
            obj.imgUrl = content.titleImg
            obj.wherefrom = content.from
            obj.breif = content.breif
            obj.is_show = 1
            obj.content = content.content
            obj.auth = 1
            obj.label = ""
            obj.typeId=2
            obj.is_community = 0
            mysqldb.addOrUpdateArticle(obj,function(){
            })
        }
    });

}

mysqldb.getArticleDetail = function (id, callback){
    var sql = "select * from article where id = " +  id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.like = function (id, callback){
    var sql = "update article set likeNum = likeNum + 1 where id = " +  id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

//--------------------------------------res资源接口实现------------------------------------------------------------------
mysqldb.addres = function(param, callback) {
    var sql = "insert into res (name,cname,res_type,type_specification) values "+
        "('"+param.name+"','"+param.cname+"'"+",'"+param.res_type+"','"+ param.type_specification+"')";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}
mysqldb.createTable = function(req, callback) {
    var tablename = 'res_content_'+req.body.name.toLowerCase();
    var tableSql =  'CREATE TABLE '+tablename+' ('+
        'id int(11) NOT NULL AUTO_INCREMENT,'+
        'content longtext NOT NULL,'+
        'createTime TIMESTAMP NOT NULL DEFAULT "0000-00-00 00:00:00",'+
        'modifiedTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'+
        'isOnLine int(2) NOT NULL DEFAULT 1,'+
        'readyNum int(11) NOT NULL DEFAULT 0,'+
        'isRecommend int(2) NOT NULL DEFAULT 0,'+
        'from_uid int(11) NOT NULL DEFAULT 0,'+
        'startTime timestamp NOT NULL DEFAULT "0000-00-00 00:00:00",'+
        'endTime timestamp NOT NULL DEFAULT "0000-00-00 00:00:00",'+
        'PRIMARY KEY (id))';
    this.query(tableSql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.updateRes = function (param, callback) {
    var sql = "update res set name='"+param.name+"',cname='"+param.cname+"',res_type='"+param.res_type
        +"',type_specification='"+param.type_specification
        +"' where id = "+param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.changeTableNameSql = function (tableName,tempTableName, callback) {
    var sql = "rename table "+tempTableName+" to "+tableName+";"
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.delRes = function(req, callback) {
    var sql = "delete from res where id ="+req.body.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}



mysqldb.getResList = function(res_type, callback) {
    var typeWhere = res_type;
    if(typeWhere){
        typeWhere = " where res_type ='"+res_type+"'"
    }else{
        typeWhere = "";
    }
    var sql = "select * from res" +typeWhere;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getResListByType = function(type, callback) {
    var sql = "select * from res where res_type='"+ type+"'";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getResListByPlate = function(id,callback) {
    var sql = "select * from res where res_type = " + id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getRes = function(id, callback) {
    var sql = "select * from res where id =" + id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.addResContent = function(param, callback) {
    var sql =  "insert into "+param.tableName+" (content,startTime,endTime,isOnline,createTime,modifiedTime," +
        "readyNum,from_uid) values ("+ param.parseContent+","+param.startTime+","+param.endTime+","+ param.onLine+
        ",now(),now(),0,"+param.from_uid+")";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.addOrUpdateArticleContent = function(param, callback) {
    var sql = "";
    if(param.id){
         sql = "update res_content set content = '"+param.content+"' where id = "+ param.id;
    }else{
         sql = "insert into res_content (content) values ('"+param.content+"')";
    }
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.updateArticleContent = function(content,contentId, callback) {
    var sql = "update res_content set content = '"+content+"' where id = "+ contentId;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.updateResContent = function(param, callback) {
    var sql =  "update "+param.tableName+" set content= "+ param.parseContent+",startTime="+
        "from_unixtime('"+param.startTime+"'),endTime=" + "from_unixtime('"+ param.endTime+"'),isOnline="
        +param.onLine+",modifiedTime=now() where id = "+param.resContentId;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.delResContent = function(param, callback) {
    var sql = "delete from res_content_"+param.type+" where id="+param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getResContentList = function(tablename, start, pageSize , callback) {
    var str = ""
    if(start&&pageSize){
        str += " limit "+start+","+pageSize
    }
    var sql = "select res.id,res.content,res.createTime,res.modifiedTime,res.isOnLine," +
        "res.readyNum,res.startTime,users.username,users.nick,users.userAavar,users.job" +
        " from res_content_"+ tablename + " as res left join bang_users as users on " +
        "res.from_uid = users.id order by createTime desc" +str
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getResContentListCount = function(tablename, callback) {
    var totalSql = "select count(id) as total from res_content_"+tablename
    this.query(totalSql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getResContentById = function(param, callback) {
    var sql = "select res.id,res.content,res.createTime,res.endTime,res.modifiedTime,res.isOnLine,res.readyNum,res.startTime," +
        "users.username,users.nick,users.userAavar,users.job from res_content_"+param.tableName +" as res " +
        "left join bang_users as users on res.from_uid = users.id where res.id ="+param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.addReadNum = function(param, callback) {
    var sql = "update res_content_"+param.tableName +" set readyNum = " + param.id+" where id ="+param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });

}

mysqldb.getArticleContentById = function(id, callback) {
    var sql = "select * from res_content where id = "+id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getRecommend = function(param, callback) {
    var sql = "select * from res_content_"+param.tableName +" where isRecommend=1 limit 0,"+param.size;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getReadyRank = function(param, callback) {
    var sql = "select * from res_content_"+param.tableName +" order by readyNum desc limit 0,"+param.size;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}


//----------------------------------------------res结束-----------------------------------------------------------------

//----------------------------------------------评论接口实现-------------------------------------------------------------

mysqldb.comment = function(param, callback) {
    var sql = "insert into comments (topic_id,content,from_uid,to_uid,reply_id,type) values "+
        "('"+param.topic_id+"','"+param.content+"','"+ param.from_uid+"','"+param.to_uid+"','"+param.reply_id+
        "','"+param.type+"')";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.queryAllUserInfo = function(replyItem,callback) {
    var sqls =[];
    var _this = this
    if(replyItem.to_uid>0){
        sqls = [
            {sql:"select id,userAavar,userName,nick from bang_users where id ="+ replyItem.from_uid,type:"from"},
            {sql:"select id,userAavar,userName,nick from bang_users where id ="+ replyItem.to_uid,type:"to"}
        ];
    }else{
        sqls = [
            {sql:"select id,userAavar,userName,nick from bang_users where id ="+ replyItem.from_uid,type:"from"},
        ];
    }
    async.map(sqls, function(item, callback) {
        _this.query(item.sql, function(err, rows) {
            if(item.type === "from"){
                replyItem.user = rows[0];
            }else{
                replyItem.to_user = rows[0];
            }
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

mysqldb.queryUserComment = function queryUserComment(param,callBack){
    var data={}
    var _this = this
    var sqls = [
        "select * from comments where  reply_id = "+param.reply_id+ " and topic_id = " +param.topic_id +" order by cTime desc",
        "select count(id) as total from comments where  reply_id = "+param.reply_id+ " and  topic_id = " +param.topic_id
    ];
    async.parallel([
            function(callback){
                _this.query(sqls[0], function(err, rows, fields){
                    if (err) {
                        console.log(err);
                    }else{
                        data.list = rows;
                        callback(err);
                    }
                });
            },
            function(callback){
                _this.query(sqls[1], function(err, rows, fields){
                    if (err) {
                        console.log(err);
                    }else{
                        data.pageTotal = rows[0].total;
                        callback(err);
                    }
                });
            }
        ],
        function(err){
            callBack(data)
        });
}

//----------------------------------------------评论结束-----------------------------------------------------------------

//----------------------------------------------用户接口实现--------------------------------------------------------------

mysqldb.login = function(username, password, callback) {
    var sql = "select id,username,userAavar,nick,phone,address,job,sex,userBreif from bang_users where " +
        "username= '"+username+"' and password = '"+password +"'";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}


mysqldb.userExistence = function(username, callback) {
    var sql = "select id from bang_users where username= '"+username +"'";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.register = function(username,password, callback) {
    var sql = "insert into bang_users (username,password) values "+
        "('"+username+"','"+password+"')";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getUserInfo = function(username, password) {
    var sql = "select * from bang_users where username= '"+username+"' and password = '"+password +"'";
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.changeUserInfo = function(param, callback) {
    var sql =  "update bang_users set userAavar='"+ param.userAavar+"',nick='"+param.nick+"',phone='" +
        param.phone+"',address='"+param.address+"',job='"+param.job+"'," +
        "sex = '"+param.sex+"',userBreif='"+param.userBreif+"' where id="+param.id;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}

mysqldb.getUserInfoById = function(id, callback) {
    var sql ="select id,username,userAavar,nick,phone,address,job,sex,userBreif from bang_users where id = "+id ;
    this.query(sql, function(err, rows){
        callback(err,rows)
    });
}





mysqldb.escape = mysql.escape;


module.exports = mysqldb;