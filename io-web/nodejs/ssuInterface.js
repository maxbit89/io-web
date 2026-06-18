var gpio = require('./gpio.js');
var mod = module.exports = {};

var debug = true;
var initgpios = 0;

mod.destroy = function() {
    gpio.destroy();
};

mod.state = function(name, interface, pinsOn, pinsOff) {
    this.name = name;
    this.interface = interface;
    this.pinsOn = pinsOn;
    this.pinsOff = pinsOff;

    this.set = function() {
        for(pin of this.pinsOn) {
            interface.gpios[pin].write(true);
        }

        for(pin of this.pinsOff) {
            interface.gpios[pin].write(false);
        }
    };
};

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

    var addNext = function(err) {
        if(err) {
            this.onChange(err);
            return;
        }

        if(nextpin < pins.length) {
            var igpio = new gpio(pins[nextpin], gpio.DIR_OUT, addNext);

            if(last_igpio != null) {
                last_igpio.onStateChange = this.onChange;
            }

            this.gpios.push(igpio);
            nextpin++;
            last_igpio = igpio;
        } else {
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
    };

    this.addStates = function(states) {
        for(name in states) {
            var cState = states[name];
            console.log('Add', name, cState);
            this.addState(name, cState.pinsOn, cState.pinsOff);
        }

        return this.gpioStates;
    };

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
    };

    this.deserialize = function(serialized) {
        // TODO
    };
};

mod.S1 = [];
mod.S2 = [];

mod.M1 = [
    { chip : '/dev/gpiochip0', line : 27 },
    { chip : '/dev/gpiochip0', line : 22 }
];

mod.M1_states = {
    'M1_0' : { pinsOn : [],     pinsOff : [0, 1] },
    'M1_1' : { pinsOn : [1],    pinsOff : [0]    },
    'M1_2' : { pinsOn : [0],    pinsOff : [1]    },
    'M1_3' : { pinsOn : [0, 1], pinsOff : []     }
};