var applicationModel = require("../database/model/app").ApplicationModel;
var tokenModel = require("../database/model/token").TokenModel;
var jwt = require("jwt-simple");
var moment = require("moment");
var datejs = require("safe_datejs");
var jalali_moment = require("moment-jalaali");


function ApplicationController() {
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
                        res.json({ state: true });
                    }
                    console.log("token updated successfully");
                });
            }
        });
    }

    function signin(req, res) {
        var appId = req.body.appId;
        var password = req.body.password;
        applicationModel.findOne({ '_id': appId }, function (err, application) {
            if (err) {
                console.log(err);
                res.send("Authentication error: error in fetching data", 401);
                return;
            }
            else {
                if (!application) {
                    console.log("application " + appId + " not found");
                    res.send("Authentic action error : application not found", 401);
                    return;
                }
                else {
                    application.verifyPassword(password, function (err, isMatch) {
                        if (err) {
                            console.log(err);
                            res.send("Authentication error: error in verify password", 401);
                            return;
                        }
                        else {
                            if (!isMatch) {
                                console.log("Authentication error : password is wrong");
                                res.send("Authentication error : password is wrong", 401);
                            }
                            else if (application.name != 'admin' && application.approved == false) {
                                console.log("application has been disabled");
                                res.send("application has been disabled", 403);
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
                                    res.json(result);
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
            hashedPassword: req.body.password,
            registerDate: (new Date()).AsDateJs(),
            name: req.body.name,
            email: req.body.email,
            approved: true,
            locked: false,
            phone: req.body.phone,
            salt: "1"
        });
        application.roles.push({ roleName: 'user' });
        application.save(function (err) {
            if (err) {
                console.log(err);
                res.send(err, 401);
            }
            else {
                console.log("send result to the client");
                res.send({message: 'application added to database successfully', appId: application.id});
            }
        });
        console.log(application);
    }

    function signupAdmin(req, res) {
        console.log("Signup new application");
        var application = new applicationModel({
            hashedPassword: req.body.password,
            registerDate: (new Date()).AsDateJs(),
            name: req.body.name,
            email: req.body.email,
            approved: false,
            locked: false,
            phone: req.body.phone,
            salt: "1",
        });
        console.log(application);
        application.roles.push({ roleName: 'admin' });
        application.save(function (err) {
            if (err)
                res.send(err, 401);
            else
                res.json({message: 'application added to database successfully', appId: application.id});
        });
    }

    function getApplicationList(req, res) {
        applicationModel.find(function (err, apps) {
            if (err)
                res.send(err, 401);
            else {
                var result = [];
                apps.forEach(function(tmpApp){
                    result.push(tmpApp.getBrief());
                });
                res.json(result);
            }
        });
    }

    function getApplication(req, res) {
        console.log("Get user by email : " + req.params.email);
        if (req.params.email) {
            applicationModel.findOne({ email: req.params.email }, function (err, application) {
                res.json(application.getBrief());
            });
        }
    }

    function getApplicationById(req, res) {
        if (req.body.appId) {
            applicationModel.findOne({'_id': req.body.appId }, function (err, application) {
                res.json(application.getBrief());
            });
        }
    }

    function getCurrentApplication(req, res) {
        return res.json(req.application.getBrief());
    }

    function addRoleToApplication(req, res) {
        try {
            applicationModel.findOne({ '_id': req.body.appId }, function (err, application) {
                if (application) {
                    var find = false;
                    for (var i = 0; i < application.roles.length; i++) {
                        if (application.roles[i].roleName == req.body.roleName) {
                            find = true;
                            break;
                        }
                    }
                    if (find == false)
                        application.roles.push({roleName: req.body.roleName});
                    res.send("ok");
                    application.save(null);
                }
                else
                    res.send('not found', 404);
            });
        }
        catch (ex) {
            console.log(ex);
            res.send(ex, 500);
        }
    }

    function changeApplicationStatus(req, res) {

        try {
            applicationModel.findOne({ '_id': req.body.appId }, function (err, application) {
                if (application) {
                    application.approved = Boolean(!application.approved);
                    approved.save(null);
                    res.send("ok");
                }
                else {
                    res.send("not found", 406);
                }
            });
        }
        catch (ex) {
            console.log(ex);
            res.send(ex, 500);
        }
    }

    function changePassword(req, res) {
        try {
            if (req.body.password) {
                req.application.verifyPassword(req.body.currentPassword, function (err, isMatch) {
                    if (err) {
                        console.log(err);
                        res.send("Authentication error: error in verify password", 401);
                        return;
                    }
                    else {
                        if (!isMatch) {
                            console.log("Authentication error : password is wrong");
                            res.send("Authentication error : password is wrong", 401);
                        }
                        else {
                            req.application.hashedPassword = req.body.password;
                            req.application.save(null);
                            res.send("save successfully");
                        }
                    }
                });
            }
        }
        catch (ex) {
            console.log(ex);
            res.send(ex, 500);
        }
    }

    function changeApplicationPassword(req, res) {
        try {
            if (req.body.password) {
                applicationModel.findOne({'_id': req.body.appId}).exec(function (err, application) {
                    if (err) {
                        console.log(err);
                        res.send(err, 500);
                    }
                    else if (user) {
                        application.hashedPassword = req.body.password;
                        application.save(null);
                        res.send("save successfully");
                    }
                });
            }
        }
        catch (ex) {
            console.log(ex);
            res.send(ex, 500);
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
        changeApplicationStatus: changeApplicationStatus
    }
}

module.exports.ApplicationController = ApplicationController;

