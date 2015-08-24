var mongoose = require('mongoose');

var PaymentRequest = new mongoose.Schema({
    requestDate: {type: Date},
    appId: {type: mongoose.Schema.ObjectId, ref:'application', required: true},
    amount: {type: Number},
    returnUrl: {type: String},
    desc: {type: String},
    mobile: {type: String},
    email: {type:String},
    gatewayId: {type: mongoose.Schema.ObjectId, ref:'paymentGateway', required: true},
    responseResultCode: {type: String},
    responseResultDesc: {type: String},
    responseRefId: {type: String},
    refId: {type: String},
    responseDate: {type: Date},
    transactionState: {type: String, enum: ['Init', 'Failed', 'Success', 'Pending']},
    ussdCode: {type: String}
});

var PaymentGateway = new mongoose.Schema({
    name: {type: String},
    createdDate: {type: String},
    url: {type: String},
    returnUrl: {type: String},
    key: {type: String},
    login: {type: String},
    status: {type: Boolean}
});

PaymentRequest.methods.getBrief = function () {
    var result = {
        id: this.id,
        paymentId: this.paymentId,
        appId: this.appId,
        amount: this.amount,
        desc: this.desc,
        gatewayId: this.gatewayId,
        requestDate: this.requestDate
    };
    return result;
}


PaymentRequest.methods.getResponse = function () {
    var result = {
        id: this.id,
        responseResultCode: this.responseResultCode,
        responseResultDesc: this.responseResultDesc,
        responseRefId: this.responseRefId,
        responseDate: this.responseDate,
        transactionState: this.transactionState
    };
    return result;
}

module.exports.PaymentRequestModel = mongoose.model('paymentRequest', PaymentRequest);
module.exports.PaymentGatewayModel = mongoose.model('paymentGateway', PaymentGateway);