var socket = io.connect();
var token = false;
var handlers = {};
var interfaces = [];

var tmp;

var Interface = function(iface) {
    this.id = iface.id;
    var frame = document.createElement("div");
    var lblInterface = document.createElement("span");
    lblInterface.innerHTML = iface.id;
    frame.appendChild(lblInterface);
    tmp = iface.gpios;
    this.gpios = iface.gpios;
    for(var gpio of this.gpios) {
        var btnGpio = document.createElement("button");
        btnGpio.innerHTML = gpio.index+" "+gpio.value;
        btnGpio.ifaceid = iface.id;
        btnGpio.gpio = gpio;
        btnGpio.addEventListener("click", handlers.set);
        frame.appendChild(btnGpio);
        gpio.dom = btnGpio;
    }
    this.gpioStates = iface.states;
    if(this.gpioStates.length > 0) {
        var lblStates = document.createElement("span");
        lblStates.innerHTML = "States:";
        frame.appendChild(lblStates);
        for(var state of this.gpioStates) {
            var btnState = document.createElement("button");
            btnState.innerHTML = state.label;
            btnState.ifaceid = iface.id;
            btnState.state = state;
            btnState.addEventListener("click", handlers.setState);
            frame.appendChild(btnState);
            state.dom = btnState;
            state.change = function(value) {
                console.log(state.label, "is ", value);
                const lineid = state.index+1
                const line = "line"+lineid;
                console.log(line)
                try {
                    setAnimation(line, value);
                } catch(e) { console.log("Can't animate")};
            }
        }
    }
    
    document.getElementById("interfaces").appendChild(frame);

    this.destory = function() {
        for(var child of document.getElementById("interfaces").childNodes) {
            if(child == frame) {
                document.getElementById("interfaces").removeChild(child);
                break;
            }
        }
    }

    this.setGpioState = function(state) {
        console.log("TODO");
    }

    this.checkStates = function(gpios) {
        for(state of this.gpioStates) {
            var isActive = true;
            for(pin of state.pinsOn) {
                if(!(gpios[pin].value === true)) {
                    isActive = false;
                    break;
                }
            }
            for(pin of state.pinsOff) {
                if(gpios[pin].value === true) {
                    isActive = false;
                    break;
                }
            }
            state.change(isActive);
        }
    }
    this.checkStates(this.gpios);

    this.update = function(rgpios) {
        console.log(rgpios);
        for(var rgpio of rgpios) {
            var lgpio = this.gpios[rgpio.index];
            lgpio.value = rgpio.value;
            lgpio.dom.innerHTML = rgpio.index+" "+rgpio.value;
        }
        this.checkStates(rgpios);
    }
}

var getInterfaceById = function(id) {
    for(var iface of interfaces) {
        if(iface.id == id) {
            return iface;
        }
    }
    return null;
}

$(function() {
   $("#askToken").on("click", handlers.askToken);
   $("#dropToken").on("click", handlers.dropToken);
   $("#pullState").on("click", handlers.downloadStateJSON);
});

let exportAbleState = null

socket.on("state", function(ifaces) {
    exportAbleState = JSON.stringify(ifaces)
    for(var iface of ifaces) {
        var oiface = getInterfaceById(iface.id);
        if(oiface == null) {
            interfaces.push(new Interface(iface));
        } else {
            console.log(iface.gpios[0].value);
            oiface.update(iface.gpios);
        }
    }
});

//reply for token:
socket.on('askToken', function(acquired) {
    token = acquired;
    //todo en/disable ui parts
    console.log("token: "+token);
});

//exception:
socket.on('exception', function(msg) {
    console.log("error: "+msg);
});


// uihandlers:
handlers.askToken = function() {
    socket.emit('askToken');
}
handlers.set = function() {
    socket.emit('set', this.ifaceid, this.gpio.index, !this.gpio.value);
}
handlers.setState = function() {
    socket.emit('setState', this.ifaceid, this.state.index)    
    console.log(this)
}
handlers.dropToken = function() {
    socket.emit('dropToken')
}
handlers.downloadStateJSON = function() {
    if(exportAbleState) {
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(exportAbleState);
        const a = document.createElement("a");
        a.href = dataUri;
        a.download = "smxStateExport.json";
        a.click();
    } else {
        alert("data is not available")
    }
}

//todo: attach ui events
