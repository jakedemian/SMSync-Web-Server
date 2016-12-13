const http = require('http');
const util = require('util');
const qs = require('querystring');

const MSG_SOURCE_MOBILE = "mobile";
const MSG_SOURCE_DESKTOP = "desktop";

/*
*	logOnServer()
*/
function logOnServer(msg){
	console.log(new Date().toISOString() + "\t\t" + msg);
}

/*
*	respondToClient()
*/
function respondToClient(response, code){
	response.writeHead(code, {'Content-Type': 'text/plain'});
    response.end();
}

/*
*	handleRequest()
*/
function handleRequest(request, response){
    if(request.method.toUpperCase() == "POST"){
    	logOnServer("POST request received.");

    	var params = '';
    	request.on('data', function (data) {
            params += data;

            if (params.length > 1e6){
            	params = '';
            	logOnServer("Destroying connection, parameter data > 1MB...");

            	respondToClient(response, 413);
                request.connection.destroy();
            } else {
            	respondToClient(response, 200);
            }
        });

        request.on('end', function () {
        	if(params != '' && params != null){
	        	params = qs.parse(params);
	        	relayMessage(request, params);
	        }	        

            logOnServer("done.");
        });
    } else {
    	logOnServer("A non-POST request was made to the server.  Declining this request.");
        respondToClient(response, 405);
        logOnServer("done.");
    }
}

/*
*	relayMessage()
*/
function relayMessage(request, params){
	if(!params.msg || !params.from || !params.to || !params.src){
		logOnServer("WARNING: POST request was made with missing required parameters!  No action will be taken.");
		return;
	}

	var message = params.msg;
	var from = params.from;
	var to = params.to;
	var src = params.src;

	if(src == MSG_SOURCE_MOBILE){
		// this information needs to be relayed to the desktop application
		logOnServer("Attempting to relay message to desktop application...");
		return;
	}
	else if(src == MSG_SOURCE_DESKTOP){
		// this information needs to be relayed to the mobile application
		logOnServer("Attempting to relay message to mobile application...");
		return;
	}

	logOnServer("Unable to relay message...");
}

// Create server and listen on PORT
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server = http.createServer(handleRequest);
server.listen(server_port, server_ip_address, 511, function () {

    logOnServer( "Listening on " + server_ip_address + ", server_port " + server_port );

});