var datejs = require('safe_datejs');
var Hapi = require("hapi");
var hapiAuthJWT = require('hapi-auth-jwt2');
var hapiCorsHeaders = require('hapi-cors-headers');
var mongoose = require('mongoose');
var argv = require('minimist')(process.argv.slice(2));
var net = require('net');

var connectionString = 'mongodb://localhost:27017/SMSGateway';
mongoose.connect(connectionString);

var applicationRouter = require("./routers/app").ApplicationRouter;
var paymentRouter = require("./routers/payment").PaymentRouter;
var applicationController = require("./controller/app").ApplicationController;



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

const config = {
    https: {
        port: 6063,
        key: Fs.readFileSync('key.key'),
        cert: Fs.readFileSync('cert.pem')
    }
}

server.connection({
    host: host,
    port: port
});


server.connection({
    host: host,
    port: config.https.port,
    tls: {
        key: config.https.key,
        cert: config.https.cert
    }
});

server.register(hapiAuthJWT, function (err) {
    if (err) {
        console.log(err);
    }
    server.auth.strategy('jwt', 'jwt', true,
        {
            key: '729183456258456',
            validateFunc: applicationController().validate,
            verifyOptions: { ignoreExpiration: true }
        });
});

server.register(require('inert'), function(err){
    if (err) {
        consle.log(err);
    }
});

server.ext('onPreResponse', hapiCorsHeaders);

applicationRouter().register(server);
paymentRouter().register(server);

server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
})

