var utility = require('../lib/moduleUtility');
var baseModule = require('./baseModule').BaseModule;

var modules = function () {
    var gatewayModules = {};
    var reloadModules = function (reloadedCallback) {
        console.log(__dirname + '/../module/gateways');
        utility.loadModules({
            folder: __dirname + '/../module/gateways',
            filter: undefined
        }, function (modules) {
            console.log("module loaded : " + modules.length);
            modules.forEach(function (module) {
                try {
                    console.log(module.getModuleId());
                    gatewayModules[module.getModuleId()] =  module;
                }
                catch(ex){
                    console.log(ex);
                }
            });
            reloadedCallback && reloadedCallback(gatewayModules);
        });
    }
    return {
        reloadModules: reloadModules,
        gatewayModules: gatewayModules
    }
}

module.exports.Modules = modules;