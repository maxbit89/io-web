var ssu = require("./ssu.js");
var jsUnit = require("./jsUnit.js");

var interface = new ssu.interface(ssu.S1, function (iface) {
    jsUnit.checkBool(iface.gpios.length, ssu.S1.length, "All GPIO pins shuld be created");
    for(gpio of iface.gpios) {
        jsUnit.checkBool(gpio.isReady, true, "Pin"+gpio.pin+" shuld be ready");
        var value = true;
        gpio.expected = value;
        gpio.write(value);
    }
}, function(err) {
    var ok = err ? false : true;
    jsUnit.checkBool(ok, true, "No Error shuld happen when writing pin:"+this.pin);
    jsUnit.checkBool(this.value, this.expected, "Value of Pin:"+this.pin+" shuld be "+this.expected);
    var value = false;
    this.expected = value;
    if(this.expected != false) {
        this.write(value);
    }
});

setTimeout(ssu.destroy, 6000);