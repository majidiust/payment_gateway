/**
 * Created by Majid on 22/08/2015.
 */
var BaseModule = require('../baseModule');
var util = require('util');
var soap = require('soap');
var request = require('request');
var logger = require('../../utility/logger');
var Database = require('../../database/database').Database;
var PRM = require('../../database/model/payment').PaymentRequestModel;
var PGM = require('../../database/model/payment').PaymentGatewayModel;


function GheimatModule(readyCallback) {
    BaseModule.call(this);
    this.setModuleName('gheimat');
    this.setModuleCredential('497d713c-4cbb-11e6-8cf6-000c295eb8fc', '497d713c-4cbb-11e6-8cf6-000c295eb8fc');
    addToDatabase('gheimat', '497d713c-4cbb-11e6-8cf6-000c295eb8fc', '497d713c-4cbb-11e6-8cf6-000c295eb8fc', 'https://www.zarinpal.com/pg/StartPay');
    this.init(readyCallback);
}

function addToDatabase(name, login, key, url, returnUrl) {
    try {
        logger.debug("add IPG Module to the database : " + name + " : " + login + " : " + key + " : " + url + " : " + returnUrl);
        Database().getPaymentGatewayByName(name, function (err) {
            logger.error(err);
        }, function () {
            Database().insertPaymentGatewayToDatabase(Database().createPaymentGateway(name, login, key, url, returnUrl), function (err) {
                logger.error(err);
            }, function (ipg) {
                logger.debug(ipg);
            });
        }, function (ipg) {
            console.log("add IPG Module to the database : " + "Created before");
        })
    }
    catch (ex) {
        console.log("add IPG Module to the database : " + ex);
    }
}

util.inherits(GheimatModule, BaseModule);

GheimatModule.prototype.makePayment = function (paymentObj, amount, desc, email, mobile, callbackurl, successCallback, errorCallback) {
    try {
        var url = 'https://ir.zarinpal.com/pg/services/WebGate/wsdl';
        var key = this.moduleInfo.key;
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Try to make call");
                var args = {
                    MerchantID: key.toString(),
                    Amount: amount.toString(),
                    Description: desc.toString(),
                    Email: email.toString(),
                    Mobile: mobile.toString(),
                    CallbackURL: callbackurl.toString()
                }
		console.log(args);
                client.PaymentRequest(args, function (err, results) {
                    if (err) {
                        errorCallback && errorCallback(err);
                    }
                    else {
			console.log(results);
                        paymentObj.refId = results.Authority;
                        paymentObj.responseResultCode = results.Status;
                        paymentObj.transactionState = "Success";
                        paymentObj.ussdCode = "*788*97*2*" + parseInt(results.Authority) +"#";
                        paymentObj.save();

//                        var ussdArgs = {
//                            MerchantID: key.toString(),
//                            Authority:  paymentObj.refId
//                        };
//                        client.UssdRequest(ussdArgs, function(ussdErr, ussdResult){
//                            if(ussdErr){
//                                errorCallback && errorCallback(ussdErr);
//                            }
//                            else{
//                                paymentObj.ussdCode = ussdResult;
//                                paymentObj.save();
//                                successCallback && successCallback(results);
//                            }
//                        });
                        successCallback && successCallback(results);

                    }
                })
            }
        });
    }
    catch (ex) {
        console.log(ex);
        res.send(ex, 500);
    }
};

GheimatModule.prototype.paymentCallback = function (req, res, errorCallback, successCallback) {
    try {
        console.log("LOG 3");
        var url = 'https://ir.zarinpal.com/pg/services/WebGate/wsdl';
        var key = this.moduleInfo.key;
        if (req.query.Status && req.query.Authority) {
            console.log(req.query);
            PRM.findOne({refId: req.query.Authority}, function (err, payment) {
                if (err) {
                    console.log(err);
                    res.send(err, 500);
                }
                else if (payment) {
                    console.log(payment);
                    PGM.findOne({'_id': payment.gatewayId}, function (err, ipg) {
                        if (err) {
                            console.log(err);
                            res.send(err, 500);
                        }
                        else if (ipg) {
                            soap.createClient(url, function (err, client) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log("Try to verify payment");
                                        var args = {
                                            MerchantID: ipg.key,
                                            Authority: req.query.Authority,
                                            Amount: payment.amount
                                        }
                                        console.log(args);
                                        client.PaymentVerification(args, function (err, results) {
                                            if (err) {
                                                errorCallback && errorCallback(err);
                                            }
                                            else {
						console.log("Salam : " + results.Status);
                                                if(parseInt(results.Status) < 0){
                                                    payment.transactionState = "Failed";
						    console.log("failed");
						}
                                                else{ 
						    payment.transactionState = "Success";
						    console.log("succedd");
						}
                                                payment.responseRefId = results.RefID;
                                                payment.responseResultCode = results.Status;
                                                payment.save(function(err){
						    err && console.log(err);
						    console.log(payment);
						    successCallback && successCallback(payment);
						});
                                            }
                                        })
                                    }
                                }
                            );
                        }
                        else {
                            res.send("IPG not found", 404);
                        }
                    });
                }
            });
        }
        else {
            console.log("There is no bank");
            res.send("There is no bank", 404);
        }
    }
    catch
        (ex) {
        console.log(ex);
        res.send(ex, 500);
    }
};

module.exports = GheimatModule;
