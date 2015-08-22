var Database = require('../database/database').Database;

var BaseModule = function () {
    this.moduleInfo = {
        name: 'base_module',
        id: null,
        url: null,
        returnUrl: null,
        key: null,
        login: null
    }
}

BaseModule.prototype.getModuleName = function getModuleName() {
    return this.moduleInfo.name
}

BaseModule.prototype.getModuleId = function getModuleId() {
    return this.moduleInfo.id
}

BaseModule.prototype.setModuleName = function setModuleName(name) {
    this.moduleInfo.name = name
}

BaseModule.prototype.setModuleCredential = function setModuleCredential(key, login) {
    this.moduleInfo.key = key;
    this.moduleInfo.login = login;
}

BaseModule.prototype.getModuleCredential = function getModuleCredential() {
    return{
        key: this.moduleInfo.key,
        login: this.moduleInfo.login
    }
}

BaseModule.prototype.setModuleUrl = function setModuleUrl(url) {
    this.moduleInfo.url = url;
}

BaseModule.prototype.getModuleUrl = function getModuleUrl() {
    return this.moduleInfo.url;
}

BaseModule.prototype.init = function init(readyCallback) {
    console.log("init the base module : " + this.moduleInfo.name);
    var self = this;
    Database().getPaymentGatewayByName(this.moduleInfo.name, null, function () {
        console.log("There is not any instance");
    }, function (name, key, login, url, id, returnUrl) {
        self.moduleInfo.name = name;
        self.moduleInfo.key = key;
        self.moduleInfo.login = login;
        self.moduleInfo.url = url;
        self.moduleInfo.id = id;
        self.moduleInfo.returnUrl = returnUrl;
        console.log(self.moduleInfo);
        readyCallback && readyCallback();
    })
}

module.exports = BaseModule;