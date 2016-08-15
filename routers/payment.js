var PaymentController = require("../controller/payment").PaymentController;

function PaymentRouter() {
    function registerRoutes(server) {
        server.route({
            method: 'GET',
            path: '/payment/getPaymentGateways',
            config: { auth: false },
            handler: PaymentController().getPaymentGateway
        });

        server.route({
            method: 'GET',
            path: '/payment/getAllPayments',
            config: { auth: false },
            handler: PaymentController().getListOfPayment
        });

        server.route({
            method: 'GET',
            path: '/payment/IPGCallback',
            config: { auth: false },
            handler: PaymentController().IPGCallback
        });

        server.route({
            method: 'GET',
            path: '/payment/paymentTestCallback',
            config: { auth: false },
            handler: PaymentController().paymentTestCallback
        });

        server.route({
            method: 'POST',
            path: '/payment/makePayment',
            config: { auth: 'jwt' },
            handler: PaymentController().makePaymentByIPGId
        });

    }

    return{
        register: registerRoutes
    }
}

module.exports.PaymentRouter = PaymentRouter;
