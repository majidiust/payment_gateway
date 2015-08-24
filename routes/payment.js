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
var modules = require('../module/modules').Modules;
var request = require('request');
var router = express.Router();


/* ************************************************** */

function makePaymentByIPGId(req, res) {
    try {
        var gatewayId = req.body.IPGId;
        var amount = req.body.amount;
        var desc = req.body.desc;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var applicationId = req.application.id;
        var returnUrl = req.body.returnUrl;
        var newPayment = new PRM({
            requestDate: (new Date()).AsDateJs(),
            appId: applicationId,
            amount: amount,
            desc: desc,
            email: email,
            mobile: mobile,
            gatewayId: gatewayId,
            returnUrl: returnUrl,
            transactionState: 'Init'
        });
        newPayment.save();
        console.log(gatewayId + " : " + amount + " : " + desc + email + " : " + mobile + " : " + applicationId);
        modules().reloadModules(function (ipgs) {
            try {
                ipgs[gatewayId].makePayment(newPayment, amount, desc, email, mobile, 'http://dev.keloud.ir:6060/payment/IPGCallback', function (results) {
                    var result = {
                        Status: results.Status,
                        Authority: results.Authority,
                        IPGName: ipgs[gatewayId].moduleInfo.name,
                        IPGUrl: ipgs[gatewayId].moduleInfo.url + "/" + results.Authority,
                        USSD: newPayment.ussdCode,
                        paymentMethod: 1
                    }
                    res.send(result, 200);
                }, function (err) {
                    res.send(err, 500);
                });
            }
            catch (ex) {
                console.log(ex);
            }
        });
    }
    catch (ex) {
        console.log(ex);
    }
}

function getPaymentGateway(req, res) {
    try {
        PGM.find({}, function (err, pgms) {
            if (err) {
                console.log(err);
                res.send(err, 500);
            }
            else if (pgms) {
                console.log(pgms);
                res.send(pgms, 200);
            }
            else {
                console.log("there is no data");
                res.send("There is no data", 403);
            }
        });
    }
    catch (ex) {
        console.log(ex);
        res.send(ex, 500);
    }
}

function IPGCallback(req, res) {
    try {
        if (req.query.Status && req.query.Authority) {
            PRM.findOne({refId: req.query.Authority}, function (err, rpm) {
                console.log("LOG 1");
                var gatewayId = rpm.gatewayId;
                console.log(rpm.gatewayId);
                modules().reloadModules(function (ipgs) {
                    try {
                        console.log("LOG 2");
                        ipgs[gatewayId].paymentCallback(req, res, function (error) {
                            console.log(error);
                        }, function (results) {
                            request.post({
                                headers: {'content-type': 'application/x-www-form-urlencoded'},
                                url: rpm.returnUrl,
                                json: { paymentData : rpm}
                            }, function (error, response, body) {
                                console.log(body);
                            });
                            res.send(results, 200);
                        }, function (err) {
                            res.send(err, 500);
                        });
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                });
            })
        }
    }
    catch (ex) {
        logger.log(ex);
        res.send(ex, 500);
    }
}

function getListOfPayment(req, res){
    PRM.find({}, function(err, rpms){
        res.send(rpms);
    })
}

function paymentTestCallback(req, res){
    try{
        console.log("####################### Callback Test #########################");
        console.log(req.body);
    }
    catch(ex){
        console.log(ex);
        res.send(ex, 500);
    }
}

// ------------------------------------------- routing procedure --------------------------------
router.route('/getPaymentGateways').get(applicationControl.requireApplicationAuthentication, getPaymentGateway);
router.route('/makePayment').post(applicationControl.requireApplicationAuthentication, makePaymentByIPGId);
router.route('/getAllPayments').get(getListOfPayment);
router.route('/IPGCallback').get(IPGCallback);
router.route('/paymentTestCallback').post(paymentTestCallback);
module.exports = router;
