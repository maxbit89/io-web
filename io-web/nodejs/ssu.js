var gpio = require('./gpio.js');
var mod = module.exports = {};

var debug = true;
var initgpios = 0;

mod.destroy = function() {
    gpio.destroy();
}

mod.interface = function(pins, onReady, onChange) {
    this.gpios = [];
    if(onChange) {
        this.onChange = onChange;
    } else {
        this.onChange = function(err) {};
    }

    var nextpin = 0;
    var last_igpio = null;
    //recursiv add gpio ports so no race condition happens
    var addNext = function(err) {
        if(nextpin < pins.length) {
            var igpio = new gpio(pins[nextpin], gpio.DIR_OUT, addNext);
            //replace onStageChange handle so addNext isn't called futher
            if(last_igpio != null) {
                last_igpio.onStateChange = this.onChange;
            }
            this.gpios.push(igpio);
            nextpin++;
            last_igpio = igpio;
        } else { //last element
            //replace onStageChange handle so addNext isn't called futher
            if(last_igpio != null) {
                last_igpio.onStateChange = this.onChange;
            }
            onReady(this);
        }
    }.bind(this);
    if(pins) {
        addNext();
    }
    this.serialize = function() {
        return this.gpios.map(function(value, label) {
            return {
                index     : label,
                isReady   : value.isReady,
                value     : value.value
            };
        });
    }
    this.deserialize = function(serialized) {
        console.log("TODO");
    }
}
mod.S1 =   [32, 31, 33, 36, 35, 38, 40, 37];

/*
var eth0 = new interface(mod.S1, function(n) {
    for(i of n.gpios) {
        console.log(i.gpioid+":"+i.isReady);
        i.write(true);
    }
});
*/
