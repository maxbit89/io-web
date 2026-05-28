var mod = module.exports = {};

var token = null;
var tokenExpireTimeStamp = -1;
mod.tokenTimeout_ms = 10000; //10s

mod.acquire = function(user) {
    mod.checkExpire(user);
    if(token == null || token == user) {
        token = user;
        tokenExpireTimeStamp = new Date().getTime() +  mod.tokenTimeout_ms;
        return true;
    } else {
        return false;
    }
}

mod.drop = function(user) {
    mod.checkExpire(user);
    if(token == user && token != null) {
        token = null;
        return true;
    } else {
        return false;
    }
}

mod.checkExpire = function(user) {
    if(token != null) {
        if(token == user) { //if owner requests validation reset expiration time
            tokenExpireTimeStamp = new Date().getTime() +  mod.tokenTimeout_ms;
        }
        if (tokenExpireTimeStamp <= new Date().getTime()) {
            mod.onTokenExpires(token);
            mod.drop(token);
        }
    } 
}

mod.onTokenExpires = function(user) {
    ;
}

mod.getToken = function(user) {
    mod.checkExpire(user);
    return token;
}
