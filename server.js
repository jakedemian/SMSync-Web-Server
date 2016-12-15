var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

const MSG_SOURCE_MOBILE = "mobile";
const MSG_SOURCE_DESKTOP = "desktop";

const ERR_MISSING_PARAM_TYPE = "Invalid or missing parameter: type";

function getAllConversationDataFromMobileApp(){
    //TODO make this actually do stuff

    return {"4405919000":{"name":"Alison Delaney","pic":"http://www.facebook.com/somePicOfAlison.jpg","msgs":[{"src":"4408971768","msg":"hi","timestamp":"Dec 15, 2016 @ 10:11:54am"},{"src":"4405919000","msg":"hi","timestamp":"Dec 15, 2016 @ 10:12:11am"},{"src":"4408971768","msg":"what's up this is a really long message because I'm testing what happens when i have an incredibly long message just like this one, which as I said is very very very long.","timestamp":"Dec 15, 2016 @ 10:12:34am"},{"src":"4405919000","msg":"not much, you?","timestamp":"Dec 15, 2016 @ 10:12:57am"},{"src":"4408971768","msg":"same","timestamp":"Dec 15, 2016 @ 10:13:41am"}]}};
}

function initDesktop(req, res){
    console.log("Obtaining conversation data from mobile application...");
    var data = getAllConversationDataFromMobileApp();
    data = JSON.stringify(data);

    res.status(200).send(data);
}

// POST request handler
app.post('/', function (req, res) {
  // we have a POST request!  we need to figure out what kind of action to take
  var type = req.body.type;

  if(!!type){
    if(type == "initDesktop"){
        initDesktop(req, res);
    }
    else if(type == "relayMsgToDesktop"){

    }
    else if(type == "relayMsgToMobile"){

    }
    else{
        res.status(400).send(ERR_MISSING_PARAM_TYPE);
    }
  } else {
    res.status(400).send(ERR_MISSING_PARAM_TYPE);
  }
});

app.listen(server_port, function () {
  console.log('Example app listening on port ' + server_port)
});