var api_gpio = require('node-gpiod');

var debug = true;

var DEFAULT_CHIP = '/dev/gpiochip0';
var DEFAULT_CONSUMER = 'io-web-multiplexer';

var openedChips = {};
var instances = [];

function normalizePin(pin) {
    if(typeof pin === 'number') {
        return {
            chip: DEFAULT_CHIP,
            line: pin
        };
    }

    if(typeof pin === 'object' && pin !== null) {
        return {
            chip: pin.chip || pin.chipPath || DEFAULT_CHIP,
            line: pin.line
        };
    }

    return {
        chip: DEFAULT_CHIP,
        line: pin
    };
}

function toGpioValue(value) {
    return value ? 1 : 0;
}

function toBoolValue(value) {
    return value === 1 || value === true;
}

function getChip(chipPath) {
    if(!openedChips[chipPath]) {
        openedChips[chipPath] = {
            instance: null,
            promise: new api_gpio(chipPath).open().then(function(chip) {
                openedChips[chipPath].instance = chip;
                return chip;
            })
        };
    }

    return openedChips[chipPath].promise;
}

module.exports = function(pin, direction, onStateChange) {
    var normalizedPin = normalizePin(pin);

    this.pin = normalizedPin.line;
    this.originalPin = pin;
    this.chip = normalizedPin.chip;
    this.direction = direction;
    this.isReady = false;
    this.value = false;
    this.request = null;
    this.apiChip = null;

    if(onStateChange) {
        this.onStateChange = onStateChange;
    } else {
        this.onStateChange = function(err) {};
    }

    instances.push(this);

    var isReady = function(err) {
        this.isReady = err ? false : true;

        if(err && debug) {
            console.log(this.chip + ' line ' + this.pin + ': ' + err);
        }

        this.onStateChange(err || null);
    }.bind(this);

    var flags = direction === module.exports.DIR_IN ? api_gpio.INPUT_MODE : api_gpio.OUTPUT_MODE;
    var initialValue = 0;
    var consumer = DEFAULT_CONSUMER + '-' + this.chip.replace('/dev/', '') + '-' + this.pin;

    getChip(this.chip).then(function(chip) {
        this.apiChip = chip;
        return chip.request_mode(this.pin, flags, initialValue, consumer);
    }.bind(this)).then(function(request) {
        this.request = request;
        this.value = false;
        isReady(null);
    }.bind(this)).catch(function(err) {
        isReady(err);
    });

    this.write = function(value) {
        if(!this.isReady || !this.apiChip || !this.request) {
            if(debug) {
                console.log(this.chip + ' line ' + this.pin + ': write ignored because GPIO is not ready');
            }
            return;
        }

        if(this.direction !== module.exports.DIR_OUT) {
            var err = new Error('Cannot write to GPIO configured as input: ' + this.chip + ' line ' + this.pin);
            this.onStateChange(err);
            return;
        }

        this.apiChip.set_values(this.request, toGpioValue(value)).then(function() {
            this.value = !!value;
            this.onStateChange(null);
        }.bind(this)).catch(function(err) {
            if(debug) {
                console.log(this.chip + ' line ' + this.pin + ': ' + err);
            }
            this.onStateChange(err);
        }.bind(this));
    }.bind(this);

    this.read = function(onReadReady) {
        if(typeof onReadReady !== 'function') {
            onReadReady = function(err, value) {};
        }

        if(!this.isReady || !this.apiChip || !this.request) {
            var err = new Error('Cannot read GPIO because it is not ready: ' + this.chip + ' line ' + this.pin);
            onReadReady(err, this.value);
            return;
        }

        if(this.direction === module.exports.DIR_OUT) {
            onReadReady(null, this.value);
            return;
        }

        this.apiChip.get_values(this.request).then(function(value) {
            this.value = toBoolValue(value);
            onReadReady(null, this.value);
        }.bind(this)).catch(function(err) {
            if(debug) {
                console.log(this.chip + ' line ' + this.pin + ': ' + err);
            }
            onReadReady(err, this.value);
        }.bind(this));
    }.bind(this);

    this.release = function() {
        if(!this.apiChip || !this.request) {
            return Promise.resolve();
        }

        return this.apiChip.terminate_request(this.request).catch(function(err) {
            if(debug) {
                console.log(this.chip + ' line ' + this.pin + ': release failed: ' + err);
            }
        }.bind(this));
    }.bind(this);
};

module.exports.destroy = function(callback) {
    var releasePromises = instances.map(function(instance) {
        return instance.release();
    });

    Promise.all(releasePromises).then(function() {
        Object.keys(openedChips).forEach(function(chipPath) {
            if(openedChips[chipPath].instance) {
                openedChips[chipPath].instance.close();
            }
        });

        instances = [];
        openedChips = {};

        if(typeof callback === 'function') {
            callback(null);
        }
    }).catch(function(err) {
        if(typeof callback === 'function') {
            callback(err);
        }
    });
};

module.exports.DIR_OUT = 'out';
module.exports.DIR_IN = 'in';
module.exports.DEFAULT_CHIP = DEFAULT_CHIP;