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
							var updateUser = function(db, callback) {
								db.collection('user').updateOne(
									doc,
									{
										$set: { 'socketid' : socketid }
									}, function(err, results) {
									callback();
								});
								console.log(msg);
								expire.expire(msg, mongo);
								expire.expireMap(msg, mongo);
								//authentifizierung erfolgreich
								server.result ({
									'status' : 'authSuccess',
									'user' : msg.user
								}, socketid);
							};
							mongo(function(err, db) {
								updateUser(db, function() {
								});
							});
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
							var updateUser = function(db, callback) {
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
							};
							mongo(function(err, db) {
								updateUser(db, function() {
								});
							});
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
							var updatePW = function(db, callback) {
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
							};
							mongo(function(err, db) {
								updatePW(db, function() {
								});
							});
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
		var liveUser = [];
		var findUser = function(db, callback) {
			clients.forEach(function(client) {
				var cursor = db.collection('user').find( { 'socketid': client } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						console.log(doc.user);
						liveUser.push(doc.user);
					} else {
						console.log(liveUser);
						server.result({
							'status' : 'provideLiveUser',
							'room' : msg.room,
							'live' : liveUser
						}, socketid);
					}
				});
			});
		};
		mongo(function(err, db) {
			findUser(db, function() {
			});
		});
	}
	
};