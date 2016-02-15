module.exports = {
	
	reg: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.pw != null) {
			var regUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						bcrypt.genSalt(10, function(err, salt) {
							bcrypt.hash(data.pw, salt, function(err, hash) {
								db.collection('user').insertOne( {
									'user' : data.user,
									'pw' : hash,
									'expireAt' : server.setExpire(new Date())
								},
								function(err, result) {
									callback(result);
								});
								expire.expire(data, mongo);
								server.result({
									'status' : 'regSuccess',
									'user' : data.user
								}, socketid);
							});
						});
					} else {
						server.result({
							'status' : 'regFailed'
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
	
	auth: function(data, socketid, mongo, bcrypt) {
		
		//var mongo = require('../mongodb.js');
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.pw != null) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				var validUser;
				cursor.each(function(err, doc) {
					if (doc != null) {
						validUser = true;
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if (res == true) {
								//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
								db.collection('user').updateOne(
									doc,
									{
										$set: { 'socketid' : socketid }
									}, function(err, results) {
									callback();
								});
								expire.expire(data, mongo);
								expire.expireTac(data, mongo);
								//authentifizierung erfolgreich
								server.result ({
									'status' : 'authSuccess',
									'user' : data.user
								}, socketid);
							} else {
								//authentifizierung fehlgeschlagen
								server.result({
									'status' : 'authFailed'
								}, socketid);
							}
						});
					} else {
						if(validUser == null) {
							server.result({
								'status' : 'authFailed'
							}, socketid);
						}
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
	
	deleteAccount: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var group = require('./group.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.pw != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				var cursorTac = db.collection('saved').find( { "user": data.user } );
				var cursorGroup = db.collection('groups').find( { 'member': data.user } );
				var passwordValid = false;
				cursor.each(function(err, doc) {
					if(doc != null) {
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if(res == true) {
								passwordValid = res;
								db.collection('user').deleteOne(doc);
								server.result({
									'status' : 'deleteAccountSuccess'
								}, socketid);
							}
						});
					} else {
						callback();
					}
				});
				if(passwordValid == true) {
					cursorTac.each(function(err, docTac) {
						db.collection('saved').deleteOne(docTac);
					});
					cursorGroup.each(function(err, docGroup) {
						if(docGroup != null) {
							group.leaveGroup({'name': docGroup.name, 'user': data.user, 'deleteAccount': true}, socketid, mongo);
						}
					});
				} else {
					server.result({
						'status' : 'deleteAccountFailed'
					}, socketid);
				}
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
	
	changeName: function(data, socketid, mongo, bcrypt) {
		
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.pw != null && data.edit != null) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if (res == true) {
								db.collection('user').updateOne(
									doc,
									{
										$set: { 'user' : data.user }
									}, function(err, results) {
									callback();
								});
								server.result({
									'status' : 'changeNameSuccess'
								}, socketid);
							} else {
								server.result({
									'status' : 'changeNameFailed'
								}, socketid);
							}
						});
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
	
	changePW: function(data, socketid, mongo, bcrypt) {
		
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.pw != null && data.edit != null) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				cursor.each(function(err, doc) {
					if(doc != null) {
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if (res == true) {
								if (doc.pw != data.pw) {
									//authentifizierung fehlgeschlagen
									server.result({
										'status' : 'changePWFailed'
									}, socketid);
								} else {
									db.collection('user').updateOne(
										doc,
										{
											$set: { 'pw' : data.pw }
										}, function(err, results) {
										callback();
									});
									server.result({
										'status' : 'changePWSuccess'
									}, socketid);
								}
							} else {
								server.result({
										'status' : 'changePWFailed'
								}, socketid);
							}
						});
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
	
	getLive: function(data, clients, socketid, mongo) {
		
		var server = require('../service.js');
		if (data.room != null) {
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
										'room' : data.room,
										'live' : liveUser
									}, socketid);
								}
							} else {
								counter--;
								if(counter == 0) {
									server.result({
										'status' : 'connectedClients',
										'room' : data.room,
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
		} else {
			
		}
		
	},
	
	storeSocketID: function(data, socketid, mongo) {
		//stellt sicher das felder nicht leer sind
		if (data.user != null) {
			//durchsucht die collection 'user' nach passerverem benutzer/passwort
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
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