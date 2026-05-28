var gpio = require("./gpio.js");
var jsUnit = require("./jsUnit.js");

var onNoMoreStateChange = function(err) {
    console.log(" * Returned Error: "+err);
    jsUnit.checkBool(false, true, "statChangeCalled (Pin: "+this.pin+") but it shouldn't be called :S");
}

/* Write/Out */
var onWriteTrue = function(err) {
    console.log(" * Returned Error: "+err);
    jsUnit.checkBool(outGpio.value, true, "Out: Value must be true after write true.");
    outGpio.onStateChange = onNoMoreStateChange;
}
var onWriteFalse = function(err) {
    console.log(" * Returned Error: "+err);
    jsUnit.checkBool(outGpio.value, false, "Out: Value must be false after write false.");
    outGpio.onStateChange = onWriteTrue;
    outGpio.write(true);
}
var onInitWrite = function(err) {
    console.log(" * Returned Error: "+err);
    var ok = (err ? false : true);
    jsUnit.checkBool(ok, true, "Out: Error should not be set when a valid gpio is set to output");
    
    jsUnit.checkBool(outGpio.isReady, true, "Out: GPIO should be ready when initialiced");
    jsUnit.checkBool(outGpio.value,   null, "Out: Value must be null after init.");
    
    outGpio.onStateChange = onWriteFalse;
    outGpio.write(false);
}

/* Read/In */
/*
var onReadFalse = function(err, value) {
    console.log(" * Returned Error: "+err);
    jsUnit.checkBool(inGpio.value, false, "In: Value must be false after read false.");
    jsUnit.checkBool(inGpio.value, value, "In: callback value shuld met gpio value");
}
var onInitRead = function(err) {
    console.log(" * Returned Error: "+err);
    var ok = (err ? false : true);
    jsUnit.checkBool(ok, true, "In: Error should not be set when a valid gpio is set to input");
    
    jsUnit.checkBool(inGpio.isReady, true, "In: GPIO  should be ready when initialiced");
    jsUnit.checkBool(inGpio.value,   null, "In: Value must be null after init.");
    
    //inGpio.onStateChange = onNoMoreStateChange;
    //inGpio.read(onReadFalse);
}
*/
outGpio = new gpio(1, gpio.DIR_OUT, onInitWrite);
//inGpio  = new gpio(31, gpio.DIR_IN,  onInitRead);

//Warning timing: if init is faster this test may fail:
jsUnit.checkBool(outGpio.isReady, false, "Out: GPIO should not be ready when not initialiced");
//jsUnit.checkBool(inGpio.isReady,  false, "In: GPIO should not be ready when not initialiced");
