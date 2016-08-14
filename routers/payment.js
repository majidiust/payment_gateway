var PaymentController = require("../controller/payment").PaymentController;

function PaymentRouter() {
    function registerRoutes(server) {
        server.route({
            method: 'GET',
            path: '/getPaymentGateways',
            config: { auth: false },
            handler: PaymentController().getPaymentGateway
        });

        server.route({
            method: 'GET',
            path: '/getAllPayments',
            config: { auth: false },
            handler: PaymentController().getListOfPayment
        });

        server.route({
            method: 'GET',
            path: '/IPGCallback',
            config: { auth: false },
            handler: PaymentController().IPGCallback
        });

        server.route({
            method: 'GET',
            path: '/paymentTestCallback',
            config: { auth: false },
            handler: PaymentController().paymentTestCallback
        });

        server.route({
            method: 'POST',
            path: '/makePayment',
            config: { auth: false },
            handler: PaymentController().makePaymentByIPGId
        });

    }

    return{
        register: registerRoutes
    }
}

module.exports.PaymentRouter = PaymentRouter;
