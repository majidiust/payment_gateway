var applicationModel = require("../database/model/app").ApplicationModel;
var tokenModel = require("../database/model/token").TokenModel;
var jwt = require("jwt-simple");
var moment = require("moment");
var datejs = require("safe_datejs");
var jalali_moment = require("moment-jalaali");


function ApplicationController() {

    function validate(decoded, request, callback) {
        console.log(" - - - - - - - DECODED token:");
        console.log(decoded);
        applicationModel.findOne({'_id': decoded.iss}, function (err, application) {
            if (!application) {
                console.log("application not found");
                return callback("Not found", false);
            }
            else if (!err) {
                tokenModel.find({
                    token: request.headers.token,
                    state: true,
                    userId: application.id
                }, function (err, tokens) {
                    if (tokens.length > 0) {
                        request.application = application;
                        console.log("application found");
                        return callback(null, true);
                    }
                    else {
                        console.log("User not authorized");
                        return callback("Not authorized", false);
                    }
                })
            }
            else {
                console.log("User not authorized");
                return callback("Not authorized", false);
            }
        });
    }

    function disableOtherAccounts(userId) {
        var today = new Date();
        var conditions = {userId: userId}
            , update = {stete: true, deleted: today.AsDateJs()}
            , options = {multi: true};
        tokenModel.update(conditions, update, options, function (err, numAffected) {
            if (err)
                logger.log('error', "error in disabling other accounts");
            else {
                logger.log('verbose', "number of updates : " + numAffected);
            }
        });
    }

    function updateUserActivity(activity, user) {
        logger.log('verbose', "Update user activity for : " + activity);
        var activity = new ActivityModel({
            activityname: activity,
            activitydate: (new Date()).AsDateJs(),
            username: user.username
        });
        activity.save(null);
    }

    function signout(req, res) {
        tokenModel.findOne({ token: req.headers.token, userId: req.application.userId }, function (err, token) {
            if (err) {
                return next(err);
            }
            else {
                token.state = false;
                token.save(function (err) {
                    if (err)
                        return next(err);
                    else {
                        return res({ state: true });
                    }
                    console.log("token updated successfully");
                });
            }
        });
    }

    function signin(req, res) {
        var appId = req.payload.appId;
        var password = req.payload.password;
        applicationModel.findOne({ '_id': appId }, function (err, application) {
            if (err) {
                console.log(err);
                return res("Authentication error: error in fetching data").code(401);
                return;
            }
            else {
                if (!application) {
                    console.log("application " + appId + " not found");
                    return res("Authentic action error : application not found").code(401);
                    return;
                }
                else {
                    application.verifyPassword(password, function (err, isMatch) {
                        if (err) {
                            console.log(err);
                            return res("Authentication error: error in verify password").code(401);
                            return;
                        }
                        else {
                            if (!isMatch) {
                                console.log("Authentication error : password is wrong");
                                return res("Authentication error : password is wrong").code(401);
                            }
                            else if (application.name != 'admin' && application.approved == false) {
                                console.log("application has been disabled");
                                return res("application has been disabled").code(403);
                            }
                            else {
                                console.log("disabling other tokens for application  : " + appId);
                                disableOtherAccounts(appId);
                                console.log("alocationg new token for application  : " + appId);
                                var expires = moment().add('days', 7).valueOf();
                                var token = jwt.encode({
                                        iss: appId,
                                        exp: expires
                                    },
                                    "729183456258456"
                                );
                                var newTokenIns = new tokenModel({
                                    userId: appId,
                                    token: token,
                                    exp: expires
                                });
                                newTokenIns.save(function (err) {
                                    if (err) {
                                        console.log("Error in saveing token in database : " + err);
                                    }
                                    else {
                                        console.log("Token saved successfully");
                                    }

                                    var result = application.getBrief();
                                    result["token"] = token;
                                    return res(result);
                                    return;
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    function signup(req, res) {
        console.log("Signup new application");
        var application = new applicationModel({
            hashedPassword: req.payload.password,
            registerDate: (new Date()).AsDateJs(),
            name: req.payload.name,
            email: req.payload.email,
            approved: true,
            locked: false,
            phone: req.payload.phone,
            salt: "1"
        });
        application.roles.push({ roleName: 'user' });
        application.save(function (err) {
            if (err) {
                console.log(err);
                return res(err).code(401);
            }
            else {
                console.log("send result to the client");
                return res({message: 'application added to database successfully', appId: application.id});
            }
        });
        console.log(application);
    }

    function signupAdmin(req, res) {
        console.log("Signup new application");
        var application = new applicationModel({
            hashedPassword: req.payload.password,
            registerDate: (new Date()).AsDateJs(),
            name: req.payload.name,
            email: req.payload.email,
            approved: false,
            locked: false,
            phone: req.payload.phone,
            salt: "1",
        });
        console.log(application);
        application.roles.push({ roleName: 'admin' });
        application.save(function (err) {
            if (err)
                return res(err).code(401);
            else
                return res({message: 'application added to database successfully', appId: application.id});
        });
    }

    function getApplicationList(req, res) {
        applicationModel.find(function (err, apps) {
            if (err)
                return res(err).code(401);
            else {
                var result = [];
                apps.forEach(function(tmpApp){
                    result.push(tmpApp.getBrief());
                });
                return res(result);
            }
        });
    }

    function getApplication(req, res) {
        console.log("Get user by email : " + req.params.email);
        if (req.params.email) {
            applicationModel.findOne({ email: req.params.email }, function (err, application) {
                return res(application.getBrief());
            });
        }
    }

    function getApplicationById(req, res) {
        if (req.payload.appId) {
            applicationModel.findOne({'_id': req.payload.appId }, function (err, application) {
                return res(application.getBrief());
            });
        }
    }

    function getCurrentApplication(req, res) {
        return res(req.application.getBrief());
    }

    function addRoleToApplication(req, res) {
        try {
            applicationModel.findOne({ '_id': req.payload.appId }, function (err, application) {
                if (application) {
                    var find = false;
                    for (var i = 0; i < application.roles.length; i++) {
                        if (application.roles[i].roleName == req.payload.roleName) {
                            find = true;
                            break;
                        }
                    }
                    if (find == false)
                        application.roles.push({roleName: req.payload.roleName});
                    return res("ok");
                    application.save(null);
                }
                else
                    return res('not found').code(404);
            });
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
        }
    }

    function changeApplicationStatus(req, res) {

        try {
            applicationModel.findOne({ '_id': req.payload.appId }, function (err, application) {
                if (application) {
                    application.approved = Boolean(!application.approved);
                    approved.save(null);
                    return res("ok");
                }
                else {
                    return res("not found").code(406);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
        }
    }

    function changePassword(req, res) {
        try {
            if (req.payload.password) {
                req.application.verifyPassword(req.payload.currentPassword, function (err, isMatch) {
                    if (err) {
                        console.log(err);
                        return res("Authentication error: error in verify password").code(401);
                        return;
                    }
                    else {
                        if (!isMatch) {
                            console.log("Authentication error : password is wrong");
                            return res("Authentication error : password is wrong").code(401);
                        }
                        else {
                            req.application.hashedPassword = req.payload.password;
                            req.application.save(null);
                            return res("save successfully");
                        }
                    }
                });
            }
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
        }
    }

    function changeApplicationPassword(req, res) {
        try {
            if (req.payload.password) {
                applicationModel.findOne({'_id': req.payload.appId}).exec(function (err, application) {
                    if (err) {
                        console.log(err);
                        return res(err).code(500);
                    }
                    else if (user) {
                        application.hashedPassword = req.payload.password;
                        application.save(null);
                        return res("save successfully");
                    }
                });
            }
        }
        catch (ex) {
            console.log(ex);
            return res(ex).code(500);
        }
    }

    return{
        signout: signout,
        signin: signin,
        signup: signup,
        signupAdmin: signupAdmin,
        changePassword: changePassword,
        changeApplicationPassword: changeApplicationPassword,
        getApplicationList: getApplicationList,
        getApplication: getApplication,
        getApplicationById: getApplicationById,
        getCurrentApplication: getCurrentApplication,
        addRoleToApplication: addRoleToApplication,
        changeApplicationStatus: changeApplicationStatus,
        validate: validate
    }
}

module.exports.ApplicationController = ApplicationController;

