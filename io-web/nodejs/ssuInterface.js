var gpio = require('./gpio.js');
var mod = module.exports = {};

var debug = true;
var initgpios = 0;

mod.destroy = function() {
    gpio.destroy();
}

mod.state = function(name, interface, pinsOn, pinsOff) {
    this.name = name;
    this.interface = interface;
    this.pinsOn = pinsOn;
    this.pinsOff = pinsOff;

    this.set = function() {
        //console.log(this.name, "pinsOn", this.pinsOn, "pinsOff", this.pinsOff, "interface", this.interface);
        for(pin of this.pinsOn) {
            //console.log("on ", pin);
            interface.gpios[pin].write(true);
        }
        for(pin of this.pinsOff) {
            //console.log("off", pin);
            interface.gpios[pin].write(false);
        }
    }
}

mod.interface = function(pins, onReady, onChange, hidden) {
    this.gpios = [];
    this.hidden = hidden;
    this.gpioStates = [];

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
    this.addState = function(name, pinsOn, pinsOff) {
        this.gpioStates.push(new mod.state(name, this, pinsOn, pinsOff));
    }
    this.addStates = function(states) {
        for(name in states) {
            var cState = states[name];
            console.log("Add", name, cState);
            this.addState(name, cState.pinsOn, cState.pinsOff);
        }
        return this.gpioStates;
    }
    this.serialize = function() {
        return {
            gpios : this.gpios.map(function(value, idx) {
                return {
                    index     : idx,
                    isReady   : value.isReady,
                    value     : value.value
                };
            }),
            states : this.gpioStates.map(function(state, idx) {
                return {
                    index     : idx,
                    label     : state.name,
                    pinsOn    : state.pinsOn,
                    pinsOff   : state.pinsOff
                };
            })
        };
    }
    this.deserialize = function(serialized) {
        //console.log("TODO");
    }
}
mod.ioCfg = {
    "mxR1" : {
        "S1" : [32, 31, 33, 36, 35, 38, 40, 37],
        "S2" : [],
        "M1" : [13, 15],
        "M1_states" : {
            "M1_0" : { pinsOn : [],     pinsOff : [0, 1] },
            "M1_1" : { pinsOn : [1],    pinsOff : [0]    },
            "M1_2" : { pinsOn : [0],    pinsOff : [1]    },
            "M1_3" : { pinsOn : [0, 1], pinsOff : []     }
        }
    },
    "ssuR2" : {
        "S1" : [ 0, 1,  2,  3,  4,  5,  6,  7],
        "S2" : [ 8, 9, 10, 11, 12, 13, 14, 15]
    }
};

/*
var eth0 = new interface(mod.S1, function(n) {
    for(i of n.gpios) {
        console.log(i.gpioid+":"+i.isReady);
        i.write(true);
    }
});
*/

/**
var m1 = new mod.interface(mod.M1, function(iface) {
        const states = mod.bindStates(mod.M1_states, iface)
        for(s of states) {
            console.log(s.name);
        }
    setTimeout(function() {states[1].set();}, 1000);
    console.log("END");
});
*/
