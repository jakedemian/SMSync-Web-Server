var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

function getFullConversationData(){
    // TODO make this ACTUALLY get this data from my mobile app.  for now just return the mock data
    return {"4405919000":{"name":"Alison Delaney","pic":"http://www.facebook.com/somePicOfAlison.jpg","msgs":[{"src":"4408971768","msg":"hi","timestamp":"Dec 15, 2016 @ 10:11:54am"},{"src":"4405919000","msg":"hi","timestamp":"Dec 15, 2016 @ 10:12:11am"},{"src":"4408971768","msg":"what's up this is a really long message because I'm testing what happens when i have an incredibly long message just like this one, which as I said is very very very long.","timestamp":"Dec 15, 2016 @ 10:12:34am"},{"src":"4405919000","msg":"not much, you?","timestamp":"Dec 15, 2016 @ 10:12:57am"},{"src":"4408971768","msg":"same","timestamp":"Dec 15, 2016 @ 10:13:41am"}]}};
}

function sendMessage(socket, msg){
    socket.emit("relayMsgToApp", msg);
    console.log("message was:  " + msg);
}

server.listen(server_port, function () {
    console.log('Example app listening on port ' + server_port)
});


const MSG_SOURCE_MOBILE = "mobile";
const MSG_SOURCE_DESKTOP = "desktop";

const ERR_MISSING_PARAM_TYPE = "Invalid or missing parameter: type";

// POST request handler
app.get('/', function (req, res) {
    res.sendfile(__dirname + "/index.html");
    app.use(express.static(__dirname + '/pub'));
});

io.on('connection', function(socket){
    // TODO customize this to respond with real data on who has connected with the server
    console.log("connected to client!");

    socket.on('refreshConvoData', function(){
        console.log("Received 'refreshConvoData' request...");
        socket.emit('convoData', getFullConversationData());
    });

    socket.on('test', function(data){
        console.log("Received test emit:  " + data);
    });

    socket.on('sendMessage', function(data){
        // relay a desktop msg to the phone app
        socket.broadcast.emit("relayMsgToApp", {"msg":data.msg, "to":data.to});
    });

    socket.on('msgToClient', function(data){
        // relay a phone message to the desktop client
        if(typeof data == "string"){
            data = JSON.parse(data);
        }

        socket.broadcast.emit("relayMsgToClient", data);
    });
});



