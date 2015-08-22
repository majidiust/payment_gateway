var express = require('express');
var applicationModel = require("../database/model/app").ApplicationModel;
var tokenModel = require("../database/model/token").TokenModel;
var jwt = require("jwt-simple");
var moment = require("moment");
var datejs = require("safe_datejs");
var jalali_moment = require("moment-jalaali");
var PGM = require('../database/model/payment').PaymentGatewayModel;
var PRM = require('../database/model/payment').PaymentRequestModel;
var applicationControl = require('./app');
var router = express.Router();


/* ************************************************** */

function makePayment(req, res){
    try{
        var gatewayId = req.body.gatewayId;
        var amount = req.body.amount;
        var desc = req.body.desc;
        var applicationId = req.application.id;
        console.log(gatewayId + " : " + amount + " : " + desc + " : " + applicationId);
        res.send("NOt implemented", 400);
    }
    catch(ex){
        console.log(ex);
    }
}

function getPaymentGateway(req, res){
    try{
        PGM.find({}, function(err, pgms){
            if(err){
                console.log(err);
                res.send(err, 500);
            }
            else if(pgms){
                console.log(pgms);
                res.send(pgms, 200);
            }
            else{
                console.log("there is no data");
                res.send("There is no data", 403);
            }
        });
    }
    catch(ex){
        console.log(ex);
        res.send(ex, 500);
    }
}

// ------------------------------------------- routing procedure --------------------------------
router.route('/getPaymentGateways').get(applicationControl.requireApplicationAuthentication, getPaymentGateway);
router.route('/makePayment').post(applicationControl.requireApplicationAuthentication, makePayment);
