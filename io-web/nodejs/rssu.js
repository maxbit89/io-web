var ssu     = require('./ssuInterface.js');
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var token   = require('./token.js');
var objectAssign = require('object-assign');

var config = {
    httpPort : 8080,
    expriationTime_ms :  10000	//5min
};

token.tokenTimeout_ms = config.expriationTime_ms;

var anysocket = null;
//send serialiced interface data:
var sendState = function(socket, broadcast) {
    if(socket != null) { //check if socket is available
        if(broadcast) {
            console.log("update state for all");
            socket.broadcast.emit("state", interfaces.serialice());
        }
        socket.emit("state", interfaces.serialice());
    } else {
        console.log("sendState failed! no socket!");
    }
}

//Kind of Ugly:
//create interfaces here:
var interfaces = [];

const onIfaceRdy = function(iface) {
    //iface.addStates(ssu.M1_states)
    console.log('interface is ready');
    sendState(anysocket, true); //send when ready (check for valid socket in sendState)
    for(gpio of iface.gpios) {
        gpio.write(false);
    }
};

const onIfaceChange = function () {
    console.log("interface changed!");
    sendState(anysocket, true); //send when io state changes (check for valid socket in sendState)
};

interfaces.push(new ssu.interface(ssu.ioCfg.ssuR2.S1, onIfaceRdy, onIfaceChange));
interfaces.push(new ssu.interface(ssu.ioCfg.ssuR2.S2, onIfaceRdy, onIfaceChange));

//makes interfaces serialize able for json etc.
interfaces.__proto__.serialice = function() {
    return this.map(function(value, label) {
        serialicedData = value.serialize();
        return {
            id : label,
            gpios : serialicedData.gpios,
            states : serialicedData.states
        };
    });
}


//set www root path:
app.use(express.static('www'));

io.on('connection', function(socket) {
    anysocket = socket;
    token.onTokenExpires = function(user) {
        console.log("Token for User("+user.conn.remoteAddress+") Expired.");
        user.emit('askToken', false);
    }
    sendState(socket);
    socket.on('askToken', function() {
        console.log("askToken!")
        var hasToken = token.acquire(socket)
        socket.emit('askToken', hasToken);
        console.log(hasToken ? "User("+socket.conn.remoteAddress+") has taken token" : "User("+socket.conn.remoteAddress+") couldn't acquire token");
    });
    socket.on('dropToken', function() {
        var hasToken = !token.drop(socket);
        if(token.getToken(socket) == null) {
            socket.emit('askToken', false);
            console.log("@User("+socket.conn.remoteAddress+"): There is no token to drop.");
        } else {
            socket.emit('askToken', hasToken);
            console.log(hasToken ? "User("+socket.conn.remoteAddress+") Droped Token" : "User("+socket.conn.remoteAddress+") wasn't in charge of Token");
        }
    });
    socket.on('hartbeat', function() {
        token.checkExpire();
        socket.emit('hartbeat', token.tokenTimeout_ms);
    });
    socket.on('disconnect', function() {
        token.drop(socket)
    });
    
    //set value
    socket.on("set", function(ifaceid, gpioid, value) {
        if(token.getToken(socket) == socket) { //only allowed if token is given to this connection expire is also updatet when getToken is called.
            if(interfaces[ifaceid].gpios[gpioid].value != value) {
                console.log("User("+socket.conn.remoteAddress+") writes:"+ifaceid+" "+gpioid+" "+value);
                interfaces[ifaceid].gpios[gpioid].write(value);
            } else {
                console.log("no change required!");
            }
        } else {
            var msg = "You must first successfully acquire the Token.";
            console.log("User("+socket.conn.remoteAddress+"): "+msg);
            socket.emit('exception', msg);
        }
    });
    socket.on("setState", function(ifaceid, stateid) {
        if(token.getToken(socket) == socket) { //only allowed if token is given to this connection expire is also updatet when getToken is called.
            interfaces[ifaceid].gpioStates[stateid].set();
            console.log("User("+socket.conn.remoteAddress+") sets state:"+ifaceid+" "+stateid);
        } else {
            var msg = "You must first successfully acquire the Token.";
            console.log("User("+socket.conn.remoteAddress+"): "+msg);
            socket.emit('exception', msg);
        }
    });
});

http.listen(config.httpPort, function() {
    console.log('http server startet on port:'+config.httpPort);
});
