var express = require('express');
var db = require('./db.js');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

var mysqlMoveMongodb = {};


mysqlMoveMongodb.move = function () {
    async.waterfall([
        function(callback){
            db.query('show tables', function(err, rows, fields) {
                callback(null, rows);
            });
        },
        function(tables,callback){
            var sql = "select * from "
            connectDb(function(err,mdb) {
                for(var i=0;i<tables.length;i++) {
                    (function(num){
                        var tableName = tables[num]['Tables_in_bangbang_web'];
                        mdb.createCollection(tableName)
                        db.query(sql+tableName, function(err, rows, fields) {
                            for(var j = 0; j < rows.length; j++) {
                                rows[j]["_id"] = rows[j]["id"];
                                delete rows[j].id
                                mdb.collection(tableName).insert(rows[j])
                            }
                        });
                    }(i))
                }
            })

        },
    ], function (err, result) {

    });

    function connectDb(callback) {
        var DB_CONN_STR = 'mongodb://localhost:27017/bangbang_web';
        MongoClient.connect(DB_CONN_STR, function(err, db) {
            console.log("连接成功！")
            callback(err, db)
        });
    }
}
module.exports = mysqlMoveMongodb;