/**
 * Created by msa on 8/14/2016 AD.
 */
var applicationModel = require("../database/model/app").ApplicationModel;
var tokenModel = require("../database/model/token").TokenModel;
var jwt = require("jwt-simple");
var moment = require("moment");
var jalali_moment = require("moment-jalaali");
var PGM = require('../database/model/payment').PaymentGatewayModel;
var PRM = require('../database/model/payment').PaymentRequestModel;
var applicationControl = require('./app');
var modules = require('../module/modules').Modules;
var request = require('request');
var mongoose = require('mongoose');
var datejs = require('safe_datejs');
var moment = require('moment-jalaali');


function PaymentController() {
    function makePaymentByIPGId(req, res) {
        try {
            var gatewayId = req.body.IPGId;
            var amount = req.body.amount;
            var desc = req.body.desc;
            var email = req.body.email;
            var mobile = req.body.mobile;
            var applicationId = req.application.id;
            var returnUrl = req.body.returnUrl;
            var renderUrl = req.body.renderUrl;
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
                ,
                renderUrl: renderUrl
            });
            newPayment.save();
            console.log(newPayment);
            console.log(gatewayId + " : " + amount + " : " + desc + email + " : " + mobile + " : " + applicationId);
            modules().reloadModules(function (ipgs) {
                try {
                    ipgs[gatewayId].makePayment(newPayment, amount, desc, email, mobile, 'http://payment.keloud.ir:6060/payment/IPGCallback', function (results) {
                        var result = {
                            Status: results.Status,
                            Authority: results.Authority,
                            IPGName: ipgs[gatewayId].moduleInfo.name,
                            IPGUrl: ipgs[gatewayId].moduleInfo.url + "/" + results.Authority,
                            USSD: newPayment.ussdCode,
                            paymentMethod: 1
                        }
                        return res(result).code(200);
                    }, function (err) {
                        return res(err).code(500);
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
                    return res(err).code(500);
                }
                else if (pgms) {
                    console.log(pgms);
                    return res(pgms).code(200);
                }
                else {
                    console.log("there is no data");
                    return res("There is no data").code(403);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
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
                                console.log(results);
                                request.post({
                                    //headers: {'content-type': 'application/x-www-form-urlencoded'},
                                    url: rpm.returnUrl,
                                    json: results
                                }, function (error, response, body) {
                                    console.log(body);
                                    if (rpm.renderUrl)
                                        res.redirect(rpm.renderUrl);
                                    else return res(results).code(200);
                                });
                                //if(rpm.renderUrl)
                                //res.render("payment.html");
                                //    res.send(results, 200);


                            }, function (err) {
                                return res(err).code(500);
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
            return res(ex).code(500);
        }
    }

    function getListOfPayment(req, res) {
        PRM.find({}, function (err, rpms) {
            return res(rpms);
        })
    }

    function paymentTestCallback(req, res) {
        try {
            console.log("####################### Callback Test #########################");
            console.log(req.body);
//	res.send(req.body);
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
        }
    }
    return{
        getPaymentGateway: getPaymentGateway,
        makePaymentByIPGId: makePaymentByIPGId,
        getListOfPayment: getListOfPayment,
        IPGCallback: IPGCallback,
        paymentTestCallback: paymentTestCallback
    }
}

module.exports.PaymentController = PaymentController;

