

/* ==========================================================================
   Tellki client side code
   ========================================================================== */

jQuery(function($){

	var iosocket = io.connect("http://127.0.0.1:1337");

	$('#sign-in').on('submit', function(event) {
		event.preventDefault();

		iosocket.emit('signIn', {
			userName: $('#user-name').val(),
			channelName: $('#channel').val()
		});
	});

	$('#message-to-send').keypress(function(e) {
		if(e.which === 13) {
			iosocket.emit('sendMessage', $('#message-to-send').val());
			$('#message-to-send').val('');
		}
	});

	$('#sign-out').on('submit', function(event) {
		alert('toto');
	});

	iosocket.on("userSignedIn", function(username, channel) {
		$("#intro-description").hide();
		$("#sign-in-container").hide();
		$("#chat").fadeIn();
		$("#chat-messages-list").append("<li class='message-item text-success'>" + username + " has signed in.</li>");
		$("#channel-name-tab").text('#' + channel);
	});

	iosocket.on("sendMessageToClients", function(username, message) {
		$("#chat-messages-list").append("<li class='message-item'>" + username + ": " + message + "</li>");
		$("#chat-messages").animate({scrollTop: $("#chat-messages").prop('scrollHeight')}, 50);
	});

	iosocket.on("updateConnectedUsers", function(connectedUsers) {
		$("#number-of-users").text(connectedUsers.length);
		$("#connected-users-list").text('');
		$.each(connectedUsers, function(connectedUser, username) {
			$("#connected-users-list").append("<li id='" + username + "' class='connected-user-item'>" + username + "</li>");
		});
	});

	iosocket.on("clientDisco", function(username) {
		$("#chat-messages-list").append("<li class='message-item text-error'>" + username + " has signed out.</li>");
	});

});