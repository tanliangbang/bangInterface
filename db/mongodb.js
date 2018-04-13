var MongoClient = require('mongodb').MongoClient;
var mongodb = {}
function connectDb(callback) {
    var DB_CONN_STR = 'mongodb://118.89.161.150:27017/gomall';
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        console.log("连接成功！")
        callback(err, db)
    });
}


mongodb.getResContentList = function(tablename, start, end , callback) {
    connectDb(function(err,mdb) {

      mdb.collection("res_content_" + tablename).find().limit(parseInt(end-start)).skip(parseInt(start)).toArray(function(err, result) {
          callback(err,result)
      })


    })
}
mongodb.getResContentListCount = function(tablename, callback) {
    connectDb(function(err,mdb) {
        mdb.collection("res_content_" + tablename).find().toArray(function(err, result) {
            var rows = [result.length]
            callback(err,rows)
        })
    })
}



module.exports = mongodb;