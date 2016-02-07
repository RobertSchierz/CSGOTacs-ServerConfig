var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var user = require('./data/user.js');
var map = require('./data/map.js');
var group = require('./data/group.js');
var result = require('./data/result.js');
var mongo = require('./mongodb.js');
var stats = require('./data/stats.js');

/*
require('socketio-auth')(io, {
  authenticate: function (socket, data, callback) {
    //get credentials sent by the client
    var username = data.username;
    var password = data.password;

    db.findUser('User', {username:username}, function(err, user) {

      //inform the callback of auth success/failure
      if (err || !user) return callback(new Error("User not found"));
      return callback(null, user.password == password);
    }
  }
});
*/
var basicAuth = require('basic-auth');

var authDevelop = function(data){
    if (!data || data.name != 'developer' || user.data != '123') {
        return false
    }else{
        return true
    }
};

/*
//ENTWICKLUNG: löscht beim serverstart alle gespeicherten karten
var removeAll = function(db, callback) {
	db.collection('saved').deleteMany( {}, function(err, results) {
		callback();
	});
	db.collection('groups').deleteMany( {}, function(err, results) {
		callback();
	});
	db.collection('user').deleteMany( {}, function(err, results) {
		callback();
	});
};

//ENTWICKLUNG: führt removeAll aus
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	removeAll(db, function() {
		db.close();
	});
});
*/

//ENTWICKLUNG: stellt index.html für testseite zur verfügung
app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname});
});

app.get('/stats', function(req, res){
	res.sendFile('stats.html', {root: __dirname});
});

app.post('/status', function(request, response){
	//if (authDevelop(basicAuth(request))){
		console.log(request.body.status);
		if (request.body.status == 'reg') {
			var data = {
				'user' : request.body.user,
				'pw' : request.body.pw
			};
			response.status(user.regRest(data, mongo));
		}
	//}
});

module.exports = {
	result: function(status, socketid) {
		var result = require('./data/result.js');
		io.sockets.connected[socketid].emit('status', result.setStatus(status));
	},
	
	setExpire: function(date) {
		var DAYS = 90;
		var expireDate = new Date(date.setDate(date.getDate() + DAYS));
		return expireDate;
	}/*,
	
	sendStats: function(msg, socketid) {
		io.sockets.connected[socketid].emit('provideStats', msg);
	}*/
};

//client verbindet sich
io.on('connection', function(socket){
	
	//client trennt verbindung
	socket.on('disconnect', function(){
	});
	/*
	//empfang und ausführung einer registrierung
	socket.on('reg', function(msg){
		user.reg(msg, socket.id, mongo);
	});
	*/
	//verarbeitung eines logins
	socket.on('auth', function(msg) {
		user.auth(msg, socket.id, mongo);
	});
	
	socket.on('reg', function(msg) {
		user.reg(msg, socket.id, mongo);
	});
	
	//empfang und ausführung einer registrierung
	socket.on('changeName', function(msg){
		user.changeName(msg, socket.id, mongo);
	});
	
	//verarbeitung eines logins
	socket.on('changePW', function(msg) {
		user.changePW(msg, socket.id, mongo);
	});
	
	//speichern einer taktik
	socket.on('createMap', function(msg){
		map.createMap(msg, socket.id, mongo);
	});
	
	//taktik einer gruppe zuordnen
	socket.on('bindMap', function(msg) {
		map.bindMap(msg, socket.id, mongo);
	});
	
	//ändern einer taktik
	socket.on('changeMap', function(msg) {
		map.changeMap(msg, socket.id, mongo);
	});
	
	//namen einer taktik ändern
	socket.on('changeMapName', function(msg) {
		map.changeMapName(msg, socket.id, mongo);
	});
	
	socket.on('deleteMap', function(msg) {
		map.deleteMap(msg, socket.id, mongo);
	});
	
	//stellt client die vom entsprechenden benutzer gespeicherten taktiken zur verfügung
	socket.on('getMaps', function(msg){
		console.log(msg);
		map.getMaps(msg, socket.id, mongo);
	});
	
	//registrieren einer gruppe
	socket.on('createGroup', function(msg){
		group.createGroup(msg, socket.id, mongo);
	});
	
	//einer gruppe beitreten
	socket.on('authGroup', function(msg) {
		group.authGroup(msg, socket.id, mongo);
	});
	
	//gibt dem client alle gruppen des benutzers zurück
	socket.on('getGroups', function(msg){
		group.getGroups(msg, socket.id, mongo);
	});
	
	//eine gruppe verlassen
	socket.on('leaveGroup', function(msg) {
		group.leaveGroup(msg, socket.id, mongo);
	});
	
	//einen user zum moderator machen
	socket.on('setGroupMod', function(msg) {
		group.setGroupMod(msg, socket.id, mongo);
	});
	
	//einen moderator zum user machen
	socket.on('unsetGroupMod', function(msg) {
		group.unsetGroupMod(msg, socket.id, mongo);
	});
	
	//einen user aus der gruppe entfernen
	socket.on('kickUser', function(msg) {
		group.kickUser(msg, socket.id, mongo);
	});
	
	//eine gruppe löschen
	socket.on('deleteGroup', function(msg) {
		group.deleteGroup(msg, socket.id, mongo);
	});
	
	socket.on('appTest', function(){
		socket.join('appTest');
	});
	
	socket.on('json', function(msg){
		socket.broadcast.to('appTest').emit('json', msg);
	});
	
	socket.on('joinGroupLive', function(msg) {
		var result = require('./data/result.js');
		var room = msg.group + '_' + msg.map;
		socket.join(room);
		socket.emit('status', {'status': 'provideRoomName', 'room' : room});
		console.log(msg.group + '_' + msg.map);
		console.log(Object.keys(socket.adapter.rooms[msg.group + '_' + msg.map]))
	});
	
	socket.on('leaveGroupLive', function(msg) {
		socket.leave(msg.room);
		console.log(Object.keys(io.sockets.adapter.rooms[msg.group + '_' + msg.map]))
	});
	
	socket.on('broadcastGroupLive', function(msg) {
		socket.broadcast.to(msg.room).emit('live', msg);
		console.log(msg);
	});
	
	socket.on('getLiveUser', function(msg) {
		var clients = Object.keys(io.sockets.adapter.rooms[msg.room]);
		user.getLive(msg, clients, socket.id, mongo);
	});
	/*
	socket.on('getStats', function() {
		console.log('test');
		stats.provide(socket.id, mongo);
	});
	*/
});

http.listen(63379, function(){
	//console.log('listening on *:63379');
});