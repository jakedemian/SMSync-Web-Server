if(typeof app == "undefined"){
window.app = {

	conversationData: {},
	currentConversationNumber: null,
	myNumber: "4408971768",
	Socket : null,

	establishSocketIoConnection : function(){
		this.Socket = io(); // connect to socket
		this.Socket.on('connect', function(socket){
			console.log("Connected to server via Socket.io!");
			app.Socket.emit('refreshConvoData');

			// IMPORTANT
			// All Socket.on's must go inside this Socket.on("connect") block!!!
			app.Socket.on('convoData', function(convoData){
				console.log("received conversation data from server...");

				app.conversationData = convoData;
				app.updateContactList();
			});

		});
	},

	updateContactList : function(){
		var contactCardTemplate = $("#contact-card-template");
		var phoneNumbers = Object.keys(this.conversationData);
		for(var i = 0; i < phoneNumbers.length; i++){
			var phoneNumber = phoneNumbers[i];
			var thisConvoData = this.conversationData[phoneNumber];
			var contactName = thisConvoData.name;
			var pic = thisConvoData.pic;

			var contactCard = contactCardTemplate.clone();
			contactCard[0].id = ""; // removed template id
			contactCard.addClass("contact-card");
			contactCard.find(".name").html(contactName);
			contactCard.css("display", "");
			contactCard.click(function(){
				if(this.currentConversationNumber != phoneNumber){
					// since this is an onclick event, I need to reference my globals as app.x, not this.x
					app.currentConversationNumber = phoneNumber;
					app.loadConversation(app.conversationData[phoneNumber].msgs);
				}
			});
			
			// set some meta data for the contact card that can be referenced later
			contactCard.data("name", contactName);
			contactCard.data("number", phoneNumber);

			$(".contact-list").append(contactCard);
		}

		if(this.currentConversationNumber == null){
			// automatically load the first conversation in the contact-list
			var firstContactInList = $(".contact-list").children().first();
			if(firstContactInList.length > 0){
				var number = firstContactInList.data("number");
				this.loadConversation(this.conversationData[number].msgs);
			}
		}
	},

	loadConversation : function(messages){
		$(".conversation-area").remove(".msg");

		for(var i = 0; i < messages.length; i++){
			var msg = messages[i];
			var myNum = app.myNumber;

			// turn this into it's own function and dynamically figure out if its you or them that sent it, and make the right messagebos accordingly.
			var timestamp = msg.timestamp; // TODO format this timestamp string

			var msgDiv = $("<div>");
			msgDiv.addClass("msg");
			myNum == msg.src ? msgDiv.addClass("msg-me") : msgDiv.addClass("msg-them");
			msgDiv.html("<span>" + timestamp + "</span>" + "<p>" + msg.msg + "</p>");
			msgDiv.insertBefore(".input-box");
		}
	},

	sendMessage : function(event, srcEle){
		if(event.keyCode == 13) { //Enter keycode
		    var msg = srcEle.value;
		    this.Socket.emit("sendMessage", msg);
		    srcEle.value = "";
		}
	}
};
}

$(document).ready(function(){
	app.establishSocketIoConnection();
});