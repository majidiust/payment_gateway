var AppController = require("../controller/app").ApplicationController;

function ApplicationRouter() {
    function registerRoutes(server) {
        server.route({
            method: 'POST',
            path: '/signupAdmin',
            config: {auth: false},
            handler: AppController().signupAdmin
        });

        server.route({
            method: 'POST',
            path: '/signup',
            config: {auth: false},
            handler: AppController().signup
        });

        server.route({
            method: 'POST',
            path: '/signin',
            config: {auth: false},
            handler: AppController().signin
        });

        server.route({
            method: 'POST',
            path: '/signout',
            config: {auth: false},
            handler: AppController().signout
        });

        server.route({
            method: 'POST',
            path: '/changePassword',
            config: {auth: false},
            handler: AppController().changePassword
        });

        server.route({
            method: 'POST',
            path: '/changeApplicationPassword',
            config: {auth: false},
            handler: AppController().changeApplicationPassword
        });

        server.route({
            method: 'GET',
            path: '/getApplicationList',
            config: {auth: false},
            handler: AppController().getApplicationList
        });

        server.route({
            method: 'GET',
            path: '/getApplicationByMail/{email}',
            config: {auth: false},
            handler: AppController().getApplication
        });

        server.route({
            method: 'POST',
            path: '/getApplicationById',
            config: {auth: false},
            handler: AppController().getApplicationById
        });

        server.route({
            method: 'GET',
            path: '/getCurrentApplication',
            config: {auth: false},
            handler: AppController().getCurrentApplication
        });

        server.route({
            method: 'POST',
            path: '/addRoleToApplication',
            config: {auth: false},
            handler: AppController().addRoleToApplication
        });

        server.route({
            method: 'POST',
            path: '/changeApplicationStatus',
            config: {auth: false},
            handler: AppController().changeApplicationStatus
        });
    }
    return{
        register: registerRoutes
    }
}

module.exports.ApplicationRouter = ApplicationRouter;
