const { Gpio } = require('onoff');

// Define GPIO number based on chip2, line 0 (GPIO 100)
const gpio100 = new Gpio(100, 'out');

// Turn the pin ON (Set HIGH)
gpio100.writeSync(1);

console.log("GPIO 100 (chip2, line 0) is now ON");

// Clean up after some time (optional)
setTimeout(() => {
    gpio100.writeSync(0);
    gpio100.unexport();
    console.log("GPIO 100 turned OFF and unexported");
}, 5000); // Turns off after 5 seconds

