var express = require('express');
var router = express.Router();
var util = require('util');
var multiparty = require('multiparty')
var fs =require('fs')
var qiniu = require('qiniu');
/* GET home page. */
router.post('/uploadImg', function(req, res, next) {
    var form = new multiparty.Form();
    var accessKey = '5c-0k9i3SZRRWwx5xGNB9fz0XVPHotYlxzqtnkh3';
    var secretKey = 'Q7Bjslx7yza_cQ98hgjXUrBd_u5z-XVaw9ETUViS';
    var bucket = 'bangbang';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var options = {
        scope: bucket,
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    var config = new qiniu.conf.Config();
    var localFile = null//"E:/Apache/htdocs/bangbang_web/nodeInterface/public/files/a1.jpg";
    config.zone = qiniu.zone.Zone_z0;
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();


//上传完成后处理
    form.parse(req, function(err, fields, files) {
         localFile = files["resImg"][0]["path"];
        if(err){
            console.log('parse error: ' + err);
        } else {
            formUploader.putFile(uploadToken, null, localFile, putExtra, function(respErr, respBody, respInfo) {
                if (respErr) {
                    throw respErr;
                }
                if (respInfo.statusCode == 200) {
                    var url = 'https://file.tanliangbang.club/'+respBody.key
                    res.send(url)
                } else {
                    console.log(respInfo.statusCode);
                    console.log(respBody);
                }
            });
        }
    });

/* var form = new multiparty.Form({uploadDir: './public/files/'});
//上传完成后处理
 form.parse(req, function(err, fields, files) {
  var filesTmp = JSON.stringify(files,null,2);
  if(err){
   console.log('parse error: ' + err);
  } else {
   var uploadedPath = files["resImg"][0]["path"];
   var dstPath = './public/files/' + files["resImg"][0].originalFilename;
//重命名为真实文件名

   var url = "http://118.89.161.150:3000/public/files/"+files["resImg"][0].originalFilename;
   fs.rename(uploadedPath, dstPath, function(err) {
    if(err){
     console.log('rename error: ' + err);
    } else {
     console.log('rename ok ===' + url  );
     res.send(url)
    }
   });
  }

 });*/

});

module.exports = router;