var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var user = require('./data/user.js');
var tac = require('./data/tac.js');
var group = require('./data/group.js');
var mongo = require('./mongodb.js');
var stats = require('./data/stats.js');

var basicAuth = require('basic-auth');

var errorMessage = 'Your JSON is incomplete!';

var bcrypt = require('bcryptjs');

//stellt statusseite zur verfügung
app.get('/', function(req, res){
	res.sendFile('status.html', {root: __dirname});
});

//externe funktionen
module.exports = {
	
	//stellt die ergebnisse der datenbankanfragen zu einem 'status' json zusammen und schickt diese an den client
	result: function(status, socketid) {
		if(status.room != undefined) {
			io.sockets.connected[socketid].nsp.to(status.room).emit('status', status);
		} else {
			io.sockets.connected[socketid].emit('status', status);
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
	socket.on('auth', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.user != undefined && data.pw != undefined) {
				user.auth(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//verarbeitung einer registrierung
	socket.on('reg', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.user != undefined && data.pw != undefined) {
				user.reg(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//ein benutzer löscht seinen account
	socket.on('deleteAccount', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.user != undefined && data.pw != undefined) {
				user.deleteAccount(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//ein benutzer ändert seinen namen
	socket.on('changeName', function(json){
		try {
			var data = JSON.parse(json);
			if(data.user != undefined && data.pw != undefined && data.edit != undefined) {
				user.changeName(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//ein benutzer ändert sein passwort
	socket.on('changePW', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.user != undefined && data.pw != undefined && data.edit != undefined) {
				user.changePW(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//speichern einer taktik
	socket.on('createTac', function(json){
		try {
			var data = JSON.parse(json);
			if(data.id != undefined && data.user != undefined && data.map != undefined && data.name != undefined && data.x != undefined && data.y != undefined && data.drag != undefined) {
				tac.createTac(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//taktik einer gruppe zuordnen
	socket.on('bindTac', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.id != undefined && data.group != undefined) {
				tac.bindTac(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//ändern einer taktik
	socket.on('changeTac', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.id != undefined && data.x != undefined && data.y != undefined && data.drag != undefined) {
				tac.changeTac(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//namen einer taktik ändern
	socket.on('changeTacName', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.id != undefined && data.name != undefined) {
				tac.changeTacName(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//löschen einer taktik
	socket.on('deleteTac', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.id != undefined) {
				tac.deleteTac(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//stellt dem client die vom entsprechenden benutzer gespeicherten taktiken zur verfügung
	socket.on('getTacs', function(json){
		try {
			var data = JSON.parse(json);
			if(data.user != undefined || data.group != undefined) {
				tac.getTacs(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//registrieren einer gruppe
	socket.on('createGroup', function(json){
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.pw != undefined) {
				group.createGroup(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//einer gruppe beitreten
	socket.on('authGroup', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.pw != undefined) {
				group.authGroup(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//gibt dem client alle gruppen des benutzers zurück
	socket.on('getGroups', function(json){
		try {
			var data = JSON.parse(json);
			if(data.user != undefined) {
				group.getGroups(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//eine gruppe verlassen
	socket.on('leaveGroup', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.user != undefined) {
				group.leaveGroup(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//einen user zum moderator machen
	socket.on('setGroupMod', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.user != undefined && data.set != undefined) {
				group.setGroupMod(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//einen moderator zum user machen
	socket.on('unsetGroupMod', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.user != undefined && data.unset != undefined) {
				group.unsetGroupMod(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//einen user aus der gruppe entfernen
	socket.on('kickUser', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.user != undefined && data.kick != undefined) {
				group.kickUser(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//eine gruppe löschen
	socket.on('deleteGroup', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.name != undefined && data.user != undefined) {
				group.deleteGroup(data, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	/*DELETEGROUP MIT PASSWORT
	socket.on('deleteGroup', function(json) {
		try {
			var data = JSON.parse(json);
			console.log(data);
			if(data.name != undefined && data.user != undefined && data.pw != undefined) {
				group.deleteGroup(data, socket.id, mongo, bcrypt);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	*/
	
	//den live-modus einer gruppe betreten
	socket.on('joinGroupLive', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.group != undefined && data.user != undefined && data.map != undefined) {
				var data = JSON.parse(json);
				user.storeSocketID({'user':data.user}, socket.id, mongo);
				var room = data.group + '_' + data.map;
				socket.join(room);
				socket.emit('status', {"status": "provideRoomName", "room" : room});
				var clients = Object.keys(io.sockets.adapter.rooms[room]);
				user.getLive({'room': room}, clients, socket.id, mongo);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//den live-modus einer gruppe verlassen
	socket.on('leaveGroupLive', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.room != undefined) {
				var data = JSON.parse(json);
				socket.leave(data.room);
				if(io.sockets.adapter.rooms[data.room] != undefined) {
					var clients = Object.keys(io.sockets.adapter.rooms[data.room]);
					user.getLive({'room': data.room}, clients, socket.id, mongo);
				}
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
	//übertragung der daten innerhalb des live-modus
	socket.on('broadcastGroupLive', function(json) {
		try {
			var data = JSON.parse(json);
			if(data.status != undefined && data.room != undefined && data.user != undefined && data.x != undefined && data.startX != undefined && data.y != undefined && data.startY != undefined && data.drag != undefined) {
				var data = JSON.parse(json);
				socket.broadcast.to(data.room).emit('status', data);
			} else {
				socket.emit('error', errorMessage);
			}
		} catch(e) {
		}
	});
	
});

//port für die socket-verbindung
http.listen(63379, function(){
});