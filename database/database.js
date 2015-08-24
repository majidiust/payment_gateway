/**
 * Created by Majid on 1/9/2015.
 */

var PaymentGateway = require('./model/payment').PaymentGatewayModel;
var PaymentRequest = require('./model/payment').PaymentRequestModel;
var mongoose = require('mongoose');
function Database() {
    function getPaymentGatewayByName(name, errCallback, notFoundCallback, findCallback, findCallbackObject) {
        PaymentGateway.findOne({name: name}).exec(function (err, payment) {
            if (err) {
                console.log(err);
                if (errCallback)
                    errCallback(err);
            }
            else if (!payment) {
                console.log("not found");
                if (notFoundCallback)
                    notFoundCallback();
            }
            else {
                console.log("found");
                if (findCallback) {
                    findCallback(payment.name, payment.key, payment.login, payment.url, payment.id, payment.returnUrl);
                }
                findCallbackObject && findCallbackObject(payment);
            }
        });
    }

    function getPaymentGatewayById(id, errCallback, notFoundCallback, findCallback, findCallbackObject) {
        PaymentGateway.findOne({'_id': id}).exec(function (err, payment) {
            if (err) {
                console.log(err);
                if (errCallback)
                    errCallback(err);
            }
            else if (!payment) {
                console.log("not found");
                if (notFoundCallback)
                    notFoundCallback();
            }
            else {
                console.log("found");
                if (findCallback) {
                    findCallback(payment.name, payment.key, payment.login, payment.url, payment.id, payment.returnUrl);
                }
                findCallbackObject && findCallbackObject(payment);
            }
        });
    }

    function getPaymentGateways(errCallback, successfulCallback) {
        PaymentGateway.find().exec(function (err, smscs) {
            if (err) {
                if (errCallback) {
                    errCallback(err);
                }
            }
            else {
                if (successfulCallback) {
                    successfulCallback(smscs)
                }
            }
        });
    }

    function createPaymentGateway(name, login, key, url, returnUrl) {
        var newPaymentGateway = new PaymentGateway({
            name: name,
            login: login,
            key: key,
            url: url,
            createdDate: (new Date()).AsDateJs(),
            returnUrl: returnUrl
        });
        return newPaymentGateway;
    }

    function insertPaymentGatewayToDatabase(model, errCallback, successfulCallback) {
        model.save(function (err) {
            if (err) {
                if (errCallback)
                    errCallback(err)
            }
            else {
                if (successfulCallback)
                    successfulCallback(model)
            }
        });
    }

    function changePaymentGatewayStatus(name, status, errCallback, notFoundCallback, successfullyCallback) {
        getPaymentGatewayByName(name, errCallback, notFoundCallback, null, function (gateway) {
            gateway.status = status;
            gateway.save(function (saveErr) {
                if (saveErr) {
                    if (errCallback)
                        errCallback(saveErr);
                }
                else {
                    if (successfullyCallback)
                        successfullyCallback(gateway);
                }
            });
        })
    }

    function addRequestPayment(paymentId, appId, amount, returnUrl, desc, gatewayId, errCallback, successfullyCallback){
        try{
            PaymentGateway.findOne({'_id': gatewayId}).exec(function(err, gateway){
                if(err)
                    errCallback && errCallback(err);
                else{
                    var request = new PaymentRequest({
                        paymentId: paymentId,
                        appId: appId,
                        requestDate: (new Date()).AsDateJs(),
                        amount: amount,
                        transactionState: 'Init',
                        returnUrl: returnUrl,
                        desc: desc,
                        gatewayId: gatewayId
                    });
                    request.save(function(err){
                        if(err){
                            if(errCallback)
                                errCallback(err);
                        }
                        else{
                            if(successfullyCallback)
                                successfullyCallback(request);
                        }
                    });
                }
            });
        }
        catch(ex){
            console.log(ex);
            errCallback && errCallback(ex);
        }
    }

    function getRequestPayment(requestId, errCallback, successCallback, successCallbackDetails){
        try{
            PaymentRequest.findOne({'_id':requestId}).exec(function(err, request){
                if(err)
                    errCallback && errCallback(err);
                else{
                    successCallback && successCallback(request);
                    successCallbackDetails && successCallbackDetails(
                        request.id,
                        request.paymentId,
                        request.appId,
                        request.amount,
                        request.desc,
                        request.gatewayId,
                        request.requestDate,
                        request.transactionState);
                }
            });
        }
        catch(ex){
            console.log(ex);
            errCallback && errCallback(ex);
        }
    }

    function setRequestPaymentResponse(state, requestId, responseResultCode, responseResultDesc, responseRefId, responseDate, errCallback, successCallback){
        try{
            PaymentRequest.findOne({'_id':requestId}).exec(function(err, request){
                if(err)
                    errCallback && errCallback(err);
                else{
                    request.responseRefId = responseRefId;
                    request.responseResultCode = responseResultCode;
                    request.responseResultDesc = responseResultDesc;
                    request.responseDate = responseDate;
                    request.transactionState = state;
                    request.save(function(errSave){
                        if(errSave){
                            errCallback && errCallback(errSave);
                        }
                        else{
                            successCallback && successCallback();
                        }
                    });
                }
            });
        }
        catch(ex){
            console.log(ex);
            errCallback && errCallback(ex);
        }
    }

    function changePaymentRequestTransactionState(requestId, transactionState, errCallback, successCallback){
        try{
            PaymentRequest.findOne({'_id':requestId}).exec(function(err, payment){
                if(err)
                    errCallback && errCallback(err);
                else{
                    payment.transactionState = transactionState;
                    payment.save(function(errSave){
                        if(errSave)
                            errCallback && errCallback(err);
                        else
                            successCallback && successCallback();
                    });
                }
            });
        }
        catch(ex){
            console.log(ex);
            errCallback && errCallback(ex);
        }
    }

    function getRequestPaymentResponse(requestId, errCallback, successCallback, successCallbackDetails){
        try{
            PaymentRequest.findOne({'_id':requestId}).exec(function(err, payment){
                if(err)
                    errCallback && errCallback(err);
                else{
                    successCallback && successCallback(payment.getResponse());
                    successCallbackDetails && successCallbackDetails(
                        payment.id,
                        payment.responseResultCode,
                        payment.responseResultDesc,
                        payment.responseRefId,
                        payment.responseDate,
                        payment.transactionState);
                }
            });
        }
        catch(ex){
            console.log(ex);
            errCallback && errCallback(ex);
        }
    }

    return {
        getPaymentGatewayByName: getPaymentGatewayByName,
        getPaymentGatewayById: getPaymentGatewayById,
        createPaymentGateway: createPaymentGateway,
        insertPaymentGatewayToDatabase: insertPaymentGatewayToDatabase,
        getPaymentGateways: getPaymentGateways,
        changePaymentGatewayStatus: changePaymentGatewayStatus,
        addRequestPayment: addRequestPayment,
        getRequestPayment: getRequestPayment,
        getRequestPaymentResponse: getRequestPaymentResponse,
        setRequestPaymentResponse: setRequestPaymentResponse,
        changePaymentRequestTransactionState: changePaymentRequestTransactionState
    };
}

module.exports.Database = Database;