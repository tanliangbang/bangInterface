var express = require('express');
var utilFn    = {};
utilFn.successSend = function(res,data,statusCode,errorMsg){
    res.writeHead(200, {'Content-Type': 'application/json'});
    if(!statusCode){
        statusCode = 200
    }
    if(!errorMsg){
        errorMsg = '请求成功'
    }
    var data ={data:data,statusCode:statusCode,errorMsg:errorMsg}
    res.end(JSON.stringify(data));
}
utilFn.checkEmpty = function(str){
    if(!str||str ==null||str =='null'){
       return "";
    }
    return str;
}

utilFn.checkNumber = function(num){
    if(!num){
        return 0;
    }
    return num;
}


utilFn.dealRes = function(rows){
    for(var i=0;i<rows.length;i++){
        rows[i].content  = JSON.parse(rows[i].content);
        //delete rows[i].content.content;
    }
    return rows;
}


utilFn.isNumber = function(value) {
    var patrn = /^[0-9]*$/;
    if (patrn.exec(value) == null || value == "") {
        return false
    } else {
        return true
    }
}

module.exports = utilFn;