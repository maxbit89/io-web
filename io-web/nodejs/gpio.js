const gpiod = require('node-gpiod');
const chips = [
    new gpiod('/dev/gpiochip2').open(),
];

for(chiph of chips) {
    chiph.then((chip) => {
        try{
            chip.get_chip_info().then((info) => {
                console.log({info});
                console.log("----Lines------");

                for(let i=0;i<info.lines;i++) {
                    chip.get_line_info(i).then((line_info) => {console.log(line_info);});
                }
            });
        } catch(err) {
            console.error(err);
        }
    });
}

debug =true;
module.exports = function(pin, direction, onStateChange) {
    this.chip = null;
    this.isReady = false;
    chips[0].then((chip) => {
        this.chip = chip;
        this.req = null;
        chip.request_mode(pin, direction, 0, "").then((req) => {
            this.req = req;
            this.isReady = true;
            isReady();
        });
    });
    this.pin = pin;
    this.direction = direction;
    this.value = false;
    if(onStateChange) {
        this.onStateChange = onStateChange; //override by user
    }
    var isReady = function(err) {
        this.isReady = err ? false : true;
        if(err && debug) {
            console.log(this.pin+' '+err);
        }
        this.onStateChange(err);
    }.bind(this);
    this.write = async function(value) {
        if(this.isReady) {
            this.value = value;
            await this.chip.set_values(this.req, this.value);
            if(this.onStateChange != null)
                console.log("trigger braodcast");
                this.onStateChange(0);
        }
    }.bind(this);
    /*
    this.read = function(onReadReady) {
        api_gpio.read(pin, function(err, value) {
            isReady(err);
            if(!err) {
                this.value = value;
            }
            onReadReady(err, value);
        });
    }.bind(this);
    */
}

module.exports.destroy = function(callback) {
    for(chiph of chips) {
        chiph.then((chip) => { chip.close() });
    }
}

//export from rpi-gpio:
module.exports.DIR_OUT = gpiod.OUTPUT_MODE;
//module.exports.DIR_IN  = api_gpio.DIR_IN;
