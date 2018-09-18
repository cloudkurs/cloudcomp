/********************************************
		Connect to Server
*********************************************/

//Loading Dependencies for express
var express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');

//Loading Dependencies for express
var app = express();
var router = express.Router();
var path = __dirname + '/views';

// Array User Online
var arrayUserOnline = [];
var arrayIdOnline = [];

// Extend filesize limit.
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use("/",router);

// access-control-origin-header
app.all
(
	'*',
	function (req, res, next)
	{
		res.header("Access-Control-Allow-Origin", "https://ptanh-chatapp.herokuapp.com");
		res.header("Access-Control-Allow-Headers", "Content-Type");
		res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS, DELETE, POST");
		res.header("Access-Control-Allow-Credentials", "true");
		next();
	}
);

/********************************************
				URL Access
*********************************************/

//Routes
router.get("/",function(req,res){
	res.sendFile(path + "/index.html");
});

router.get("/about",function(req,res){
	res.sendFile(path + "/about.html");
});

/********************************************
			Server Configuration
*********************************************/

var server = app.listen(process.env.PORT || 3000, function(){
	var port = server.address().port
	console.log("Server is listening at Port:%s", port)
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

	socket.on('client_send_reset', function(){
		arrayUserOnline.length = 0;
		arrayIdOnline.length = 0;
		io.sockets.emit('server_send_reset');
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
