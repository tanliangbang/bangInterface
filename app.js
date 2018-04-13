var express = require('express');
var session = require('express-session');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var upload = require('./routes/upload');
var res = require('./routes/res');
var plate = require('./routes/plate');
var comments = require('./routes/comments');
var article = require('./routes/article');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json({ "limit":"10000kb"}));
app.use(bodyParser.urlencoded({ "limit":"10000kb"}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static('public'))

app.use(session({
    secret: '12345',
    //name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 1000*60*60*24 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));


app.use('/', index);
app.use('/api', index);
app.use('/api/users', users);
app.use('/api/upload', upload);
app.use('/api/comments', comments);
app.use('/api/plate', plate);
app.use('/api/res', res);
app.use('/api/article', article);







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
