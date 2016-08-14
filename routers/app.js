var AppController = require("../controller/app").ApplicationController;

function ApplicationRouter() {
    function registerRoutes(server) {
        server.route({
            method: 'POST',
            path: '/signupAdmin',
            config: {auth: false},
            handler: ApplicationRouter().signupAdmin
        });

        server.route({
            method: 'POST',
            path: '/signup',
            config: {auth: false},
            handler: ApplicationRouter().signup
        });

        server.route({
            method: 'POST',
            path: '/signin',
            config: {auth: false},
            handler: ApplicationRouter().signin
        });

        server.route({
            method: 'POST',
            path: '/signout',
            config: {auth: false},
            handler: ApplicationRouter().signout
        });

        server.route({
            method: 'POST',
            path: '/changePassword',
            config: {auth: false},
            handler: ApplicationRouter().changePassword
        });

        server.route({
            method: 'POST',
            path: '/changeApplicationPassword',
            config: {auth: false},
            handler: ApplicationRouter().changeApplicationPassword
        });

        server.route({
            method: 'GET',
            path: '/getApplicationList',
            config: {auth: false},
            handler: ApplicationRouter().getApplicationList
        });

        server.route({
            method: 'GET',
            path: '/getApplicationByMail/{email}',
            config: {auth: false},
            handler: ApplicationRouter().getApplication
        });

        server.route({
            method: 'POST',
            path: '/getApplicationById',
            config: {auth: false},
            handler: ApplicationRouter().getApplicationById
        });

        server.route({
            method: 'GET',
            path: '/getCurrentApplication',
            config: {auth: false},
            handler: ApplicationRouter().getCurrentApplication
        });

        server.route({
            method: 'POST',
            path: '/addRoleToApplication',
            config: {auth: false},
            handler: ApplicationRouter().addRoleToApplication
        });

        server.route({
            method: 'POST',
            path: '/changeApplicationStatus',
            config: {auth: false},
            handler: ApplicationRouter().changeApplicationStatus
        });
    }
    return{
        register: registerRoutes
    }
}

module.exports.ApplicationRouter = ApplicationRouter;
