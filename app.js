var datejs = require('safe_datejs');
var Hapi = require("hapi");
var hapiAuthJWT = require('hapi-auth-jwt2');
var hapiCorsHeaders = require('hapi-cors-headers');
var mongoose = require('mongoose');
var argv = require('minimist')(process.argv.slice(2));
var net = require('net');

var connectionString = 'mongodb://localhost:27017/SMSGateway';
mongoose.connect(connectionString);

var userRouter = require("./routers/user").UserRouter;
var userController = require("./controllers/user").UserController;
var GT06Controller = require("./controllers/GT06Controller").GT06Controller;
var GPSDataRouter = require("./routers/gpslocation").GPSDataRouter;
var DeviceGroup = require("./routers/devicegroup").DeviceGroupRouter;
var DeviceRouter = require("./routers/device").DeviceRouter;
var schedule = require('./cron/cron.js').CronJob;


'use strict';

var cors = {
    origin: ['*'],
    headers: ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'X-Requested-With'],
}

const server = new Hapi.Server({
    connections: {
        routes: {
            cors: cors
        }
    }
});

var host = '0.0.0.0';
var port = 6060;

if('h' in argv) {
    host = String(argv.h);
}
if('p' in argv) {
    port = Number(argv.p);
}

server.connection({
    host: host,
    port: port
});


server.register(hapiAuthJWT, function (err) {
    if (err) {
        console.log(err);
    }
    server.auth.strategy('jwt', 'jwt', true,
        {
            key: '729183456258456',
            validateFunc: userController().validateUser,
            verifyOptions: { ignoreExpiration: true }
        });
});

server.register(require('inert'), function(err){
    if (err) {
        consle.log(err);
    }
});

server.ext('onPreResponse', hapiCorsHeaders);

userRouter().register(server);
GPSDataRouter().register(server);
DeviceGroup().register(server);
DeviceRouter().register(server);

server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
})

