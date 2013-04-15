

/* ==========================================================================
   Tellki server side code
   ========================================================================== */

var port = (process.env.VCAP_APP_PORT || 3000);
var http = require('http').createServer();
http.listen(port);
console.log('Server running on ' + port);

/* ######## */

var io = require('socket.io').listen(http);

// If WebSockets are not supported by the server
io.set('transports', ['xhr-polling']);

var utils = require('./utils');
var channelsFilePath = './channels.json';

io.sockets.on('connection', function(client) {

  /**
  * Sign in
  */
  client.on('signIn', function(signInfos) {
    var channelName = signInfos.channelName;
    var userName = signInfos.userName;

    console.log('Sign in attempt : ' + userName + ' in #' + channelName);

    // Creates the channel if it doesn't exist
    if(!utils.getChannel(channelsFilePath, channelName)) {
      console.log('#' + channelName + ' does not exist.');
      utils.addChannel(channelsFilePath, channelName);
    }
    
    client.join(channelName);
    console.log(userName + ' joined #' + channelName);
    client.username = userName;
    client.channel = channelName;
    io.sockets.in(client.channel).emit('userSignedIn', userName, channelName);
    updateConnectedUsers(client.channel);
  });


  /**
  * Send chat message
  */
  client.on('sendMessage', function(message) {
    io.sockets.in(client.channel).emit('sendMessageToClients', client.username, message);
  });


  /**
  * Client disco
  */
  client.on('disconnect', function() {
    io.sockets.in(client.channel).emit('clientDisco', client.username);
    client.leave(client.channel);
    updateConnectedUsers(client.channel);
  });


  /**
  * Update connected users
  */
  var updateConnectedUsers = function(channel) {
    var connectedUsers = [];
    var connectedSockets = io.sockets.clients(channel);
    console.log('Update connected users: ' + connectedSockets.length);

    /* Update the connected users array depending on the sockets connected in the channel */
    for(var connectedSocket in connectedSockets) {
      connectedUsers.push(connectedSockets[connectedSocket].username);
    }

    // Send connected users array to the clients
    io.sockets.in(channel).emit('updateConnectedUsers', connectedUsers);
  };


});


