var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connectionString = 'mongodb://localhost:27017/SMSGateway';
var mongoose = require('mongoose');
mongoose.connect(connectionString);
var apps = require('./routes/app');
var payment = require('./routes/payment');
var modules = require('./module/modules').Modules;
var cors = require("cors");
var app = express();
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('key-cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use(cors());

modules().reloadModules(function (smsModules) {
    try {
    }
    catch(ex){
        console.log(ex);
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
//app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/application', apps);
app.use('/payment', payment);
/// catch 404 and forward to error handler

app.all("/*", function (req, res, next) {
    console.log("middle logger layer");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With");
    next();
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(6060);
httpsServer.listen(6063);


module.exports = app;

