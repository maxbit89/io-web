var colors = require('colors');
var mod = module.exports = {};
mod.checkBool = function(value, expected, msg) {
    var result = value == expected;
    var resultMsg = (result) ? "PASS".green : "FAIL".red;
    console.log("["+resultMsg+"] : "+msg);
    if(!result) {
        console.log("expected:"+expected+", actual:"+value);
    }
}

mod.checkDeviation = function(value, expected, deviasion, msg) {
    var result_Max = value < expected+deviasion;
    var result_Min = value > expected-deviasion;
    mod.checkBool(result_Max || result_Min);
}
