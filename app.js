var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//variablen für mongodb
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//datei enthält zugangsdaten
var mongoAccess = require('./mongodb.js');
var url = mongoAccess.url;
var ObjectId = require('mongodb').ObjectID;

/*
//ENTWICKLUNG: löscht beim serverstart alle gespeicherten karten
var removeAll = function(db, callback) {
	db.collection('saved').deleteMany( {}, function(err, results) {
		callback();
	});
	db.collection('groups').deleteMany( {}, function(err, results) {
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

//client verbindet sich
io.on('connection', function(socket){
	function result(answer){
		var answer = {
			'status' : answer.status,
			'user' : answer.user || null,
			'member' : answer.member || null,
			'admin' : answer.admin || null,
			'mods' : answer.mods || null,
			'maps' : answer.maps || null,
			'name' : answer.name || null,
			'group' : answer.group || null,
			'groups' : answer.groups || null
		};
		io.sockets.connected[socket.id].emit('status', answer);
	};
	//client trennt verbindung
	socket.on('disconnect', function(){
		socket.leave('appTest');
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
							callback(result);
						});
						result({
							'status' : 'regSuccess'
						});
					} else {
						result({
							'status' : 'regFailed'
						});
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
			result({
				'status' : 'regFailed'
			});
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
							result({
								'status' : 'authFailed'
							});
						} else {
							//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
							var updateUserId = function(db, callback) {
								db.collection('user').updateOne(
									doc,
									{
										$set: { "clientid": socket.id },
										$currentDate: { "login": true }
									}, function(err, results) {
									callback();
								});
							};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								updateUserId(db, function() {
									db.close();
								});
							});
							//authentifizierung erfolgreich
							result({
								'status' : 'authSuccess',
								'user' : msg.user
							});
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
			result({
				'status' : 'authFailed'
			});
		} 
	});
	
	//speichern einer taktik
	socket.on('createMap', function(msg){
		if ( msg.id != null && msg.user != null && msg.map != null && msg.name != null ) {
			var createMap = function(db, callback) {
				var groupName;
				if (msg.group != undefined) {
					groupName = msg.group;
				} else {
					groupName = '';
				}
				db.collection('saved').insertOne( {
					'id' : msg.id,
					'user' : msg.user,
					'map' : msg.map,
					'name' : msg.name,
					'group' : groupName,
					'drag' : msg.drag,
					'x' : msg.x,
					'y' : msg.y
				},
				function(err, result) {
					assert.equal(err, null);
					callback(result);
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				createMap(db, function() {
					db.close();
				});
			});
			result({
				'status' : 'createMapSuccess'
			});
		} else {
			result({
				'status' : 'createMapFailed'
			});
		}
	});
	
	//ändern einer taktik
	socket.on('changeMap', function(msg) {
		//stellt sicher das felder nicht leer sind
		if (msg.id != '') {
			var findMap = function(db, callback) {
				var cursor = db.collection('saved').find( { "id": msg.id } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						var updateXY = function(db, callback) {
							db.collection('saved').updateOne(
								doc,
								{
									$set: { 'drag' : msg.drag, 'x' : msg.x, 'y' : msg.y }
								}, function(err, results) {
								callback();
							});
						};
						MongoClient.connect(url, function(err, db) {
							assert.equal(null, err);
							updateXY(db, function() {
								db.close();
							});
						});
						result({
							'status' : 'changeMapSuccess'
						});
					} else {
						result({
							'status' : 'changeMapFailed'
						});
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'changeMapFailed'
			});
		} 
	});
	
	//namen einer taktik ändern
	socket.on('changeMapName', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.id != '') && (msg.name != '')) {
			var findMap = function(db, callback) {
				var cursor = db.collection('saved').find( { "id": msg.id } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						var updateName = function(db, callback) {
							db.collection('saved').updateOne(
								doc,
								{
									$set: { 'name' : msg.name }
								}, function(err, results) {
								callback();
							});
						};
						MongoClient.connect(url, function(err, db) {
							assert.equal(null, err);
							updateName(db, function() {
								db.close();
							});
						});
						result({
							'status' : 'changeMapNameSuccess'
						});
					} else {
						result({
							'status' : 'changeMapNameFailed'
						});
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'changeMapNameFailed'
			});
		} 
	});
	
	socket.on('deleteMap', function(msg) {
		//stellt sicher das felder nicht leer sind
		if (msg.id != '') {
			var findMap = function(db, callback) {
				var cursor = db.collection('saved').find( { 'id': parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						var deleteMap = function(db, callback) {
							db.collection('saved').deleteOne(
								doc
							);
						};
						MongoClient.connect(url, function(err, db) {
							assert.equal(null, err);
							deleteMap(db, function() {
								db.close();
							});
						});
						result({
							'status' : 'deleteMapSuccess'
						});
					} else {
						result({
							'status' : 'deleteMapFailed'
						});
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'deleteMapFailed'
			});
		} 
	});
	
	//stellt client die vom entsprechenden benutzer gespeicherten taktiken zur verfügung
	socket.on('getMaps', function(msg){
		var maps = [];
		var getMaps = function(db, callback) {
			//alle vom benutzer erstellten maps auslesen und in array pushen
			var findMaps = function(db, callback) {
				var cursor;
				if (msg.user != undefined) {
					cursor = db.collection('saved').find( { "user": msg.user } );
				} else if (msg.group != undefined) {
					cursor = db.collection('saved').find( { "group": msg.group } );
				}
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						maps.push({
							'id' : doc.id,
							'map' : doc.map,
							'name' : doc.name,
							'group' : doc.group,
							'drag' : doc.drag,
							'x' : doc.x,
							'y' : doc.y
						});
					} else {
						//übergibt dem client das maps array
						result({
							'status' : 'provideMaps',
							'maps' : maps
						});
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
	
	//registrieren einer gruppe
	socket.on('createGroup', function(msg){
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.pw != '')) {
			var createGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.count(function(err, doc) {
					assert.equal(err, null);
					if (doc == 0) {
						var member = [];
						var mods = [];
						member.push(msg.user);
						db.collection('groups').insertOne( {
							'name' : msg.name,
							'pw' : msg.pw,
							'member' : member,
							'admin' : msg.user,
							'mods' : mods
						},
						function(err, result) {
							assert.equal(err, null);
							callback(result);
						});
						result({
							'status' : 'createGroupSuccess'
						});
					} else {
						result({
							'status' : 'createGroupFailed'
						});
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				createGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'createGroupFailed'
			});
		}
	});
	
	//einer gruppe beitreten
	socket.on('authGroup', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.pw != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					//prüft ob gruppe existiert und stellt sicher das der user noch nicht eingetragen wurde
					if(doc != null) {
						if (doc.member.indexOf(msg.user) <= -1) {
							if (doc.pw != msg.pw) {
								result({
									'status' : 'authGroupFailed'
								});
							} else {
								//user wird in 'member' array eingetragen
								var updateMember = function(db, callback) {
									db.collection('groups').updateOne(
										doc,
										{
											$push: { member: msg.user }
										}, function(err, results) {
										callback();
									});
								};
								MongoClient.connect(url, function(err, db) {
									assert.equal(null, err);
									updateMember(db, function() {
										db.close();
									});
								});
								result({
									'status' : 'authGroupSuccess',
									'member' : doc.member,
									'admin' : doc.admin,
									'mods' : doc.mods
								})
							}
						} else {
							result({
								'status' : 'authGroupFailed'
							});
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'authGroupFailed'
			});
		} 
	});
	
	//gibt dem client alle gruppen des benutzers zurück
	socket.on('getGroups', function(msg){
		var groups = [];
		var getGroups = function(db, callback) {
			var findGroups = function(db, callback) {
				var cursor = db.collection('groups').find({ "member": msg.user })
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						groups.push({
							'name' : doc.name,
							'member' : doc.member,
							'admin' : doc.admin,
							'mods' : doc.mods
						});
					} else {
						result({
							'status' : 'provideGroups',
							'groups' : groups
						});
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroups(db, function() {
					db.close();
				});
			});
		};
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			getGroups(db, function() {
				db.close();
			});
		});
	});
	
	//eine gruppe verlassen
	socket.on('leaveGroup', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					//prüft ob gruppe existiert und stellt sicher das der user ein mitglied ist
					if(doc != null) {
						if (doc.member.indexOf(msg.user) > -1) {
							//user wird aus 'member' array entfernt
							var updateMember = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { member: msg.user }
									}, function(err, results) {
									callback();
								});
							};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								updateMember(db, function() {
									db.close();
								});
							});
							result({
								'status' : 'leaveGroupSuccess',
								'group' : doc.name
							});
						} else {
							result({
								'status' : 'leaveGroupFailed',
								'group' : doc.name
							});
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'leaveGroupFailed'
			});
		} 
	});
	
	//einen user zum moderator machen
	socket.on('setGroupMod', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if (doc.mods.indexOf(msg.user) <= -1) {
							//user wird in 'mods' array eingetragen
							var updateMods = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$push: { mods: msg.user }
									}, function(err, results) {
									callback();
								});
							};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								updateMods(db, function() {
									db.close();
								});
							});
							result({
								'status' : 'setGroupModSuccess'
							});
						} else {
							result({
								'status' : 'setGroupModFailed'
							});
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'setGroupModFailed'
			});
		} 
	});
	
	//einen user aus der gruppe entfernen
	socket.on('kickUser', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.user != '') && (msg.name != '') && (msg.kick != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if ((doc.admin == msg.user) || (doc.mods.indexOf(msg.user) > -1)) {
							//user wird aus gruppe entfernt
							var updateMember = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { member: msg.kick }
									}, function(err, results) {
									callback();
								});
								if (doc.mods.indexOf(msg.kick) > -1) {
									db.collection('groups').updateOne(
										doc,
										{
											$pull: { mods: msg.kick }
										}, function(err, results) {
										callback();
									});
								}
							};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								updateMember(db, function() {
									db.close();
								});
							});
							result({
								'status' : 'kickUserSuccess'
							});
						} else {
							result({
								'status' : 'kickUserFailed'
							});
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'kickUserFailed'
			});
		} 
	});
	
	//eine gruppe löschen
	socket.on('deleteGroup', function(msg) {
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					assert.equal(err, null);
					if(doc != null) {
						if (doc.admin.indexOf(msg.user) > -1) {
							var deleteGroup = function(db, callback) {
								db.collection('groups').deleteOne(
									doc);
								};
							MongoClient.connect(url, function(err, db) {
								assert.equal(null, err);
								deleteGroup(db, function() {
									db.close();
								});
							});
							result({
								'status' : 'deleteGroupSuccess'
							});
						} else {
							result({
								'status' : 'deleteGroupFailed'
							});
						}
					} else {
						callback();
					}
				});
			};
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				findGroup(db, function() {
					db.close();
				});
			});
		} else {
			result({
				'status' : 'deleteGroupFailed'
			});
		} 
	});
	
	socket.on('appTest', function(){
		socket.join('appTest');
	});
	
	socket.on('json', function(msg){
		socket.broadcast.to('appTest').emit('json', msg);
	});
	
});

http.listen(63379, function(){
	//console.log('listening on *:63379');
});