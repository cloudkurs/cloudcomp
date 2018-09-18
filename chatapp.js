var express = require("express");
var app = express();
var io = require("socket.io").listen(server);

var path = __dirname + '/views';

// Array User Online
var arrayUserOnline = [];
var arrayIdOnline = [];

/********************************************
			Server Configuration
*********************************************/

var server = app.listen(process.env.PORT || 3000, function(){
	var host = server.address().address
	var port = server.address().port

	console.log("Server is listening at http://%s:%s", host, port)
});

/********************************************
				URL Access
*********************************************/

//Web Aplication
app.get("/",function(req,res){
	res.sendFile(path + "/index.html");
});

app.get("/about",function(req,res){
	res.sendFile(path + "/about.html");
});

/********************************************
			IO Configuration
*********************************************/
var io = require('socket.io')(server);

io.on ('connection', function(socket){
	console.log ('User connect successful!, socketID is :' + socket.id);
	
	socket.on('client_send_useronline', function(){
		socket.emit('server_send_userOnlineList', {user:arrayUserOnline, id:arrayIdOnline});
	});

	socket.on('client_send_username', function(data){
		console.log ('User log in with id:' + data);
		if (arrayUserOnline.indexOf(data)>=0){
			socket.emit('server_send_register_fail', data);
		} else {
			arrayUserOnline.push(data);
			arrayIdOnline.push(socket.id);
			socket.username = data;
			io.sockets.emit('server_send_register_success', {username:data, id:socket.id});
			socket.emit('server_send_register_success_close', data);
		}
	});

	socket.on('client_send_message', function(data){
		io.sockets.emit("server_send_message", {username:socket.username, msg:data});
	});

	socket.on('user_ping', function(data){
		io.to(data).emit("user_pong", socket.username);
	});

});
