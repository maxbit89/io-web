var token = require("./token.js");
var jsUnit = require("./jsUnit.js");

var userA = {name: "userA"};
var userB = {name: "userB"};

var token = require("./token.js");

token.tokenTimeout_ms = 500; //set timeout to 500ms

jsUnit.checkBool(token.drop(userA), false, "User can not be droped when no user acquire Token");
jsUnit.checkBool(token.acquire(userA), true, "User can acquire if no other user acquired Token");
jsUnit.checkBool(token.acquire(userA), true, "User get ok when user allready acquired Token");
jsUnit.checkBool(token.acquire(userB), false, "Another user can not acquire the Token when another user already acquired the Token");
jsUnit.checkBool(token.drop(userA), true, "User can drop the token when he acquired it");
jsUnit.checkBool(token.acquire(userB), true, "Another user can acquire the Token when another user dropped it");

setTimeout(function() {
    jsUnit.checkBool(token.acquire(userA), true, "User can acquire if the token Expired");
    jsUnit.checkBool(token.acquire(userB), false, "Another user can not acquire the Token when another user already acquired the Token after Token Expired");
    jsUnit.checkBool(token.drop(userA), true, "User can drop the token when he acquired it after Token Expired");
    jsUnit.checkBool(token.acquire(userB), true, "Another user can acquire the Token when another user dropped it after Token Expired");
}, token.tokenTimeout_ms + 10);
