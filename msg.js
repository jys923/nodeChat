// model/msg.js

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let chatMsg = new mongoose.Schema({    
    roomName : String,
    uuId : String,
    name : String,
    msg : String,
    time : { type: Date, default: Date.now }
})

module.exports = mongoose.model("msg", chatMsg);