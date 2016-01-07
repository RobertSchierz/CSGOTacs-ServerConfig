var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//variablen für mongodb
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//enthält login und url/datenbank
var mongoAccess = require('./mongodb.js');
var url = mongoAccess.url;
var ObjectId = require('mongodb').ObjectID;

/*
//ENTWICKLUNG: löscht beim serverstart alle gespeicherten karten
var removeAll = function(db, callback) {
	db.collection('saved').deleteMany( {}, function(err, results) {
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

//ENTWICKLUNG: stellt index.html für testseite zur verfügung
app.get('/', function(req, res){
	res.sendFile('index.html', {root: __dirname});
});
*/

//client verbindet sich
io.on('connection', function(socket){
	//console.log('client verbunden');
	//client trennt verbindung
	socket.on('disconnect', function(){
		//console.log('client getrennt');
	});
	
	//empfang und ausführung einer registrierung
	socket.on('reg', function(msg){
		//stellt sicher das felder nicht leer sind
		if ((msg.user != '') && (msg.pw != '')) {
			var regUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.count(function(err, doc) {
					assert.equal(err, null);
					if (doc == 0) {
						db.collection('user').insertOne( {
							'clientid' : socket.id,
							'user' : msg.user,
							'pw' : msg.pw
						},
						function(err, result) {
							assert.equal(err, null);
							//console.log('benutzer erstellt');
							callback(result);
						});
						io.sockets.connected[socket.id].emit('regSuccess');
					} else {
						io.sockets.connected[socket.id].emit('regFailed');
						console.log('fehlgeschlagen');
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				regUser(db, function() {
					db.close();
				});
			});
		} else {
			io.sockets.connected[socket.id].emit('regFailed');
			console.log('fehlgeschlagen');
		}
	});
	
	//verarbeitung eines logins
	socket.on('auth', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.user != '') && (msg.pw != '')) {
			//durchsucht die collection 'user' nach passendem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						if (doc.pw != msg.pw) {
							//authentifizierung fehlgeschlagen
							io.sockets.connected[socket.id].emit('authFailed');
							console.log('login fehlgeschlagen');
						} else {
							//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
							var updateUserId = function(db, callback) {
								db.collection('user').updateOne(
									doc,
									{
										$set: { "clientid": socket.id },
										$currentDate: { "login": true }
									}, function(err, results) {
									//console.log(results);
									callback();
								});
							};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								updateUserId(db, function() {
									db.close();
								});
							});
							var answer = {
								'user' : doc.user
							};
							//authentifizierung erfolgreich
							io.sockets.connected[socket.id].emit('authSuccess', answer);
							console.log('login erfolgreich');
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findUser(db, function() {
					db.close();
				});
			});
		} else {
			io.sockets.connected[socket.id].emit('authFailed');
			console.log('login fehlgeschlagen');
		} 
	});
	
	//speichern einer map
	socket.on('createMap', function(msg){
		var createMap = function(db, callback) {
			/*
			var user;
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "clientid": socket.id } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						user = doc.user;
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findUser(db, function() {
					db.close();
				});
			});
			*/
			db.collection('saved').insertOne( {
				'id' : msg.id,
				'user' : msg.user,
				'map' : msg.map,
				'name' : msg.name,
				'x' : msg.x,
				'y' : msg.y
			},
			function(err, result) {
				assert.equal(err, null);
				//console.log('karte erstellt');
				callback(result);
			});
		};
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			createMap(db, function() {
				db.close();
			});
		});
	});
	
	//stellt client die vom entsprechenden benutzer gespeicherten maps zur verfügung
	socket.on('getMaps', function(msg){
		var maps = [];
		var getMaps = function(db, callback) {
			//alle vom benutzer erstellten maps auslesen und in array pushen
			var findMaps = function(db, callback) {
				var cursor = db.collection('saved').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						maps.push({
							'id' : doc.id,
							'map' : doc.map,
							'name' : doc.name,
							'x' : doc.x,
							'y' : doc.y
						});
					} else {
						//übergibt dem client das maps array
						io.sockets.connected[socket.id].emit('provideMaps', maps);
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findMaps(db, function() {
					db.close();
				});
			});
		};
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			getMaps(db, function() {
				db.close();
			});
		});
	});
	
	/*
	socket.on('jsonClient', function(msg){
		socket.broadcast.emit('json', msg);
	});
	*/
});

http.listen(63379, function(){
	//console.log('listening on *:63379');
});