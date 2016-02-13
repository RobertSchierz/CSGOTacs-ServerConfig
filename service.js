var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var user = require('./data/user.js');
var tac = require('./data/tac.js');
var group = require('./data/group.js');
var result = require('./data/result.js');
var mongo = require('./mongodb.js');
var stats = require('./data/stats.js');

var basicAuth = require('basic-auth');

//stellt statusseite zur verfügung
app.get('/', function(req, res){
	res.sendFile('status.html', {root: __dirname});
});

/*
app.post('/status', function(request, response){
	//if (authDevelop(basicAuth(request))){
		if (request.body.status == 'reg') {
			var data = {
				'user' : request.body.user,
				'pw' : request.body.pw
			};
			response.status(user.regRest(data, mongo));
		}
	//}
});
*/

//externe funktionen
module.exports = {
	
	//stellt die ergebnisse der datenbankanfragen zu einem 'status' json zusammen und schickt diese an den client
	result: function(status, socketid) {
		var result = require('./data/result.js');
		var getResult = result.setStatus(status);
		if(status.room != null) {
			io.sockets.connected[socketid].nsp.to(status.room).emit('status', getResult);
		} else {
			io.sockets.connected[socketid].emit('status', getResult);
		}
	},
	
	//erzeugt das ablaufdatum eines dokuments
	setExpire: function(date) {
		var DAYS = 90;
		var expireDate = new Date(date.setDate(date.getDate() + DAYS));
		return expireDate;
	}
	
};

//client verbindet sich
io.on('connection', function(socket){
	
	//client trennt verbindung (oder wird durch timeout getrennt)
	socket.on('disconnect', function(){
	});
	
	//verarbeitung eines logins
	socket.on('auth', function(msg) {
		user.auth(JSON.parse(msg), socket.id, mongo);
	});
	
	//verarbeitung einer registrierung
	socket.on('reg', function(msg) {
		var data
		user.reg(JSON.parse(msg), socket.id, mongo);
	});
	
	//ein benutzer löscht seinen account
	socket.on('deleteAccount', function(msg) {
		user.deleteAccount(JSON.parse(msg), socket.id, mongo);
	});
	
	//ein benutzer ändert seinen namen
	socket.on('changeName', function(msg){
		user.changeName(JSON.parse(msg), socket.id, mongo);
	});
	
	//ein benutzer ändert sein passwort
	socket.on('changePW', function(msg) {
		user.changePW(JSON.parse(msg), socket.id, mongo);
	});
	
	//speichern einer taktik
	socket.on('createTac', function(msg){
		tac.createTac(JSON.parse(msg), socket.id, mongo);
	});
	
	//taktik einer gruppe zuordnen
	socket.on('bindTac', function(msg) {
		tac.bindTac(JSON.parse(msg), socket.id, mongo);
	});
	
	//ändern einer taktik
	socket.on('changeTac', function(msg) {
		tac.changeTac(JSON.parse(msg), socket.id, mongo);
	});
	
	//namen einer taktik ändern
	socket.on('changeTacName', function(msg) {
		tac.changeTacName(JSON.parse(msg), socket.id, mongo);
	});
	
	//löschen einer taktik
	socket.on('deleteTac', function(msg) {
		tac.deleteTac(JSON.parse(msg), socket.id, mongo);
	});
	
	//stellt dem client die vom entsprechenden benutzer gespeicherten taktiken zur verfügung
	socket.on('getTacs', function(msg){
		tac.getTacs(JSON.parse(msg), socket.id, mongo);
	});
	
	//registrieren einer gruppe
	socket.on('createGroup', function(msg){
		group.createGroup(JSON.parse(msg), socket.id, mongo);
	});
	
	//einer gruppe beitreten
	socket.on('authGroup', function(msg) {
		group.authGroup(JSON.parse(msg), socket.id, mongo);
	});
	
	//gibt dem client alle gruppen des benutzers zurück
	socket.on('getGroups', function(msg){
		group.getGroups(JSON.parse(msg), socket.id, mongo);
	});
	
	//eine gruppe verlassen
	socket.on('leaveGroup', function(msg) {
		group.leaveGroup(JSON.parse(msg), socket.id, mongo);
	});
	
	//einen user zum moderator machen
	socket.on('setGroupMod', function(msg) {
		group.setGroupMod(JSON.parse(msg), socket.id, mongo);
	});
	
	//einen moderator zum user machen
	socket.on('unsetGroupMod', function(msg) {
		group.unsetGroupMod(JSON.parse(msg), socket.id, mongo);
	});
	
	//einen user aus der gruppe entfernen
	socket.on('kickUser', function(msg) {
		group.kickUser(JSON.parse(msg), socket.id, mongo);
	});
	
	//eine gruppe löschen
	socket.on('deleteGroup', function(msg) {
		group.deleteGroup(JSON.parse(msg), socket.id, mongo);
	});
	
	//den live-modus einer gruppe betreten
	socket.on('joinGroupLive', function(msg) {
		var data = JSON.parse(msg);
		user.storeSocketID({'user':data.user}, socket.id, mongo);
		var room = data.group + '_' + data.map;
		socket.join(room);
		socket.emit('status', {"status": "provideRoomName", "room" : room});
		var clients = Object.keys(io.sockets.adapter.rooms[room]);
		user.getLive({'room': room}, clients, socket.id, mongo);
	});
	
	//den live-modus einer gruppe verlassen
	socket.on('leaveGroupLive', function(msg) {
		var data = JSON.parse(msg);
		socket.leave(data.room);
		if(io.sockets.adapter.rooms[data.room] != undefined) {
			var clients = Object.keys(io.sockets.adapter.rooms[data.room]);
			user.getLive({'room': data.room}, clients, socket.id, mongo);
		}
	});
	
	//übertragung der daten innerhalb des live-modus
	socket.on('broadcastGroupLive', function(msg) {
		var data = JSON.parse(msg);
		socket.broadcast.to(data.room).emit('status', data);
	});
	
	
	
	
	//ENTWICKLUNG: TEST DER LIVE-VERBINDUNG ZWISCHEN DEN APPS
	socket.on('appTest', function(){
		socket.join('appTest');
		var clients = Object.keys(io.sockets.adapter.rooms['appTest']);
		user.getLive({"room": "appTest"}, clients, socket.id, mongo);
		//socket.broadcast.to('appTest').emit();
	});
	
	socket.on('json', function(msg){
		socket.broadcast.to('appTest').emit('json', msg);
	});
	
	
	
	
	
});

//port für die socket-verbindung
http.listen(63379, function(){
});