

/* ==========================================================================
   Tellki server side code
   ========================================================================== */

var port = (process.env.VMC_APP_PORT || 1337);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http').createServer();
http.listen(port, host);
console.log('Server running on ' + host + ':' + port);

/* ######## */

var io = require('socket.io').listen(http);
var utils = require('./utils');
var channelsFilePath = './channels.json';


io.sockets.on('connection', function(client) {


  client.on('signIn', function(signInfos) {
    var channelName = signInfos.channelName;
    var userName = signInfos.userName;

    console.log('Sign in attempt : ' + userName + ' in #' + channelName);

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


  client.on('sendMessage', function(message) {
    io.sockets.in(client.channel).emit('sendMessageToClients', client.username, message);
  });


  client.on('disconnect', function() {
    io.sockets.in(client.channel).emit('clientDisco', client.username);
    client.leave(client.channel);
    updateConnectedUsers(client.channel);
  });


  var updateConnectedUsers = function(channel) {
    var connectedUsers = [];
    var connectedSockets = io.sockets.clients(channel);
    console.log('Update connected users: ' + connectedSockets.length);

    for(var connectedSocket in connectedSockets) {
      connectedUsers.push(connectedSockets[connectedSocket].username);
    }

    io.sockets.in(channel).emit('updateConnectedUsers', connectedUsers);
  };


});


