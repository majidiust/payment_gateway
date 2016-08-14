var AppController = require("../controller/app").ApplicationController;

function ApplicationRouter() {
    function registerRoutes(server) {
        server.route({
            method: 'POST',
            path: '/application/signupAdmin',
            config: {auth: false},
            handler: AppController().signupAdmin
        });

        server.route({
            method: 'POST',
            path: '/application/signup',
            config: {auth: false},
            handler: AppController().signup
        });

        server.route({
            method: 'POST',
            path: '/application/signin',
            config: {auth: false},
            handler: AppController().signin
        });

        server.route({
            method: 'POST',
            path: '/application/signout',
            config: {auth: false},
            handler: AppController().signout
        });

        server.route({
            method: 'POST',
            path: '/application/changePassword',
            config: {auth: false},
            handler: AppController().changePassword
        });

        server.route({
            method: 'POST',
            path: '/application/changeApplicationPassword',
            config: {auth: false},
            handler: AppController().changeApplicationPassword
        });

        server.route({
            method: 'GET',
            path: '/application/getApplicationList',
            config: {auth: false},
            handler: AppController().getApplicationList
        });

        server.route({
            method: 'GET',
            path: '/application/getApplicationByMail/{email}',
            config: {auth: false},
            handler: AppController().getApplication
        });

        server.route({
            method: 'POST',
            path: '/application/getApplicationById',
            config: {auth: false},
            handler: AppController().getApplicationById
        });

        server.route({
            method: 'GET',
            path: '/application/getCurrentApplication',
            config: {auth: false},
            handler: AppController().getCurrentApplication
        });

        server.route({
            method: 'POST',
            path: '/application/addRoleToApplication',
            config: {auth: false},
            handler: AppController().addRoleToApplication
        });

        server.route({
            method: 'POST',
            path: '/application/changeApplicationStatus',
            config: {auth: false},
            handler: AppController().changeApplicationStatus
        });
    }
    return{
        register: registerRoutes
    }
}

module.exports.ApplicationRouter = ApplicationRouter;
