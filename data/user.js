module.exports = {
	
	reg: function(msg, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			var regUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						db.collection('user').insertOne( {
							'user' : msg.user,
							'pw' : msg.pw,
							'expireAt' : server.setExpire(new Date())
						},
						function(err, result) {
							callback(result);
						});
						expire.expire(msg, mongo);
						server.result({
							'status' : 'regSuccess',
							'user' : msg.user
						}, socketid);
					} else {
						server.result({
							'status' : 'regFailed',
							'user' : msg.user
						}, socketid);
					}
				});
			};
			mongo(function(err, db) {
				regUser(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'regFailed'
			}, socketid);
		}
		
	},
	
	regRest: function(msg, mongo) {
		//var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			var regUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						db.collection('user').insertOne( {
							'user' : msg.user,
							'pw' : msg.pw,
							'expireAt' : server.setExpire(new Date())
						},
						function(err, result) {
							callback(result);
						});
						expire.expire(msg, mongo);
						return 201;
					} else {
						return 500;
					}
				});
			};
			mongo(function(err, db) {
				regUser(db, function() {
				});
			});
		} else {
			return 500;
		}
	},
	
	auth: function(msg, socketid, mongo) {
		
		//var mongo = require('../mongodb.js');
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						if (doc.pw != msg.pw) {
							//authentifizierung fehlgeschlagen
							server.result({
								'status' : 'authFailed'
							}, socketid);
						} else {
							//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
							db.collection('user').updateOne(
								doc,
								{
									$set: { 'socketid' : socketid }
								}, function(err, results) {
								callback();
							});
							expire.expire(msg, mongo);
							expire.expireTac(msg, mongo);
							//authentifizierung erfolgreich
							server.result ({
								'status' : 'authSuccess',
								'user' : msg.user
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findUser(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'authFailed'
			}, socketid);
		} 
		
	},
	
	deleteAccount: function(msg, socketid, mongo) {
		var server = require('../service.js');
		var group = require('./group.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				var cursorTac = db.collection('saved').find( { "user": msg.user } );
				var cursorGroup = db.collection('groups').find( { 'member': msg.user } );
				cursor.each(function(err, doc) {
					if(doc != null) {
						db.collection('user').deleteOne(doc);
						server.result({
							'status' : 'deleteAccountSuccess'
						}, socketid);
					} else {
						callback();
					}
				});
				cursorTac.each(function(err, docTac) {
					db.collection('saved').deleteOne(docTac);
				});
				cursorGroup.each(function(err, docGroup) {
					if(docGroup != null) {
						group.leaveGroup({'name': docGroup.name, 'user': msg.user, 'deleteAccount': true}, socketid, mongo);
					}
				});
			};
			mongo(function(err, db) {
				findUser(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'deleteAccountFailed'
			}, socketid);
		} 
	},
	
	changeName: function(msg, socketid, mongo) {
		
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						if (doc.pw != msg.pw) {
							//authentifizierung fehlgeschlagen
							server.result({
								'status' : 'changeNameFailed'
							}, socketid);
						} else {
							db.collection('user').updateOne(
								doc,
								{
									$set: { 'user' : msg.user }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'changeNameSuccess'
							}, socketid);
						}
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeNameFailed'
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findUser(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'changeNameFailed'
			}, socketid);
		} 
		
	},
	
	changePW: function(msg, socketid, mongo) {
		
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (msg.pw != null && msg.pw != undefined)) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						if (doc.pw != msg.pw) {
							//authentifizierung fehlgeschlagen
							server.result({
								'status' : 'changePWFailed'
							}, socketid);
						} else {
							db.collection('user').updateOne(
								doc,
								{
									$set: { 'pw' : msg.pw }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'changePWSuccess'
							}, socketid);
						}
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changePWFailed'
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findUser(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'changePWFailed'
			}, socketid);
		} 
		
	},
	
	getLive: function(msg, clients, socketid, mongo) {
		
		var server = require('../service.js');
		var findUser = function(db, callback) {
			var liveUser = [];
			var counter = clients.length;
			var result = 
			setTimeout(function() {
				clients.forEach(function(client) {
					var cursor = db.collection('user').find( { 'socketid': client } );
					cursor.each(function(err, doc) {
						if(doc != null) {
							liveUser.push(doc.user);
							if(counter == 0) {
								server.result({
									'status' : 'connectedClients',
									'room' : msg.room,
									'live' : liveUser
								}, socketid);
							}
						} else {
							counter--;
							if(counter == 0) {
								server.result({
									'status' : 'connectedClients',
									'room' : msg.room,
									'live' : liveUser
								}, socketid);
							}
						}
					});
				});
			}, 100);
		};
		mongo(function(err, db) {
			findUser(db, function() {
			});
		});
		
	},
	
	storeSocketID: function(msg, socketid, mongo) {
		//stellt sicher das felder nicht leer sind
		if ((msg.user != null && msg.user != undefined) && (socketid != null && socketid != undefined)) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				cursor.each(function(err, doc) {
					db.collection('user').updateOne(
						doc,
						{
							$set: { 'socketid' : socketid }
						},
						function(err, results) {
						callback();
					});
				});
			};
			mongo(function(err, db) {
				findUser(db, function() {
				});
			});
		} else {
		} 
	}
	
};