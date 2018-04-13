var express = require('express');
var db    = {};
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'tanliangbang',
    database        : 'bangbang_web',
    charset: 'UTF8_GENERAL_CI'
});


db.query = function(sql, callback){

    if (!sql) {
        callback();
        return;
    }
    pool.query(sql, function(err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        };
        callback(null, rows, fields);
    });
};

db.escape = mysql.escape;


module.exports = db;


db.query = function(sql, callback){
    if (!sql) {
        callback();
        return;
    }
    pool.query(sql, function(err, rows, fields) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        };
        callback(null, rows, fields);
    });
};

db.escape = mysql.escape;


module.exports = db;  