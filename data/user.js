module.exports = {
	
	/**
	* Prüft ob ein Benutzername vergeben ist und erzeugt den neuen Benutzer in der collection 'user'
	* Führt sowohl bei einem failed als auch bei einem success die result-Funktion des Servers aus
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param socketid - Die Socket ID des verbundenen Clients
	* @param mongo - Die Datenbankverbindung
	* @param bcrypt - Die einbindung von bcrypt, zum ver- und entschlüsseln der Passwörter
	*/
	reg: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		if ((data.user != null && data.user != '') && (data.pw != null && data.pw != '')) {
			var regUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						bcrypt.genSalt(10, function(err, salt) {
							bcrypt.hash(data.pw, salt, function(err, hash) {
								db.collection('user').insertOne( {
									'user' : data.user,
									'pw' : hash,
									'expireAt' : expire.setExpire(new Date())
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
	
	/**
	* Prüft ob das eingegebene Passwort zu dem Benutzernamen passt
	* Führt sowohl bei einem failed als auch bei einem success die result-Funktion des Servers aus
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param socketid - Die Socket ID des verbundenen Clients
	* @param mongo - Die Datenbankverbindung
	* @param bcrypt - Die einbindung von bcrypt, zum ver- und entschlüsseln der Passwörter
	*/
	auth: function(data, socketid, mongo, bcrypt) {
		
		var server = require('../service.js');
		var expire = require('./expire.js');
		if (data.user != null && data.pw != null) {
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				var validUser;
				cursor.each(function(err, doc) {
					if (doc != null) {
						validUser = true;
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if (res == true) {
								db.collection('user').updateOne(
									doc,
									{
										$set: { 'socketid' : socketid }
									}, function(err, results) {
									callback();
								});
								expire.expire(data, mongo);
								expire.expireTac(data, mongo);
								server.result ({
									'status' : 'authSuccess',
									'user' : data.user
								}, socketid);
							} else {
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
	
	/**
	* Prüft ob das eingegebene Passwort zu dem Benutzernamen passt
	* Der entsprechende Benutzer wird aus der user-Collection entfernt
	* Führt sowohl bei einem failed als auch bei einem success die result-Funktion des Servers aus
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param socketid - Die Socket ID des verbundenen Clients
	* @param mongo - Die Datenbankverbindung
	* @param bcrypt - Die einbindung von bcrypt, zum ver- und entschlüsseln der Passwörter
	*/
	deleteAccount: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var group = require('./group.js');
		if (data.user != null && data.pw != null) {
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
	
	/**
	* Prüft ob das eingegebene Passwort zu dem Benutzernamen passt
	* Der Name des entsprechenden Benutzers wird durch den neuen Namen ersetzt
	* Führt sowohl bei einem failed als auch bei einem success die result-Funktion des Servers aus
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param socketid - Die Socket ID des verbundenen Clients
	* @param mongo - Die Datenbankverbindung
	* @param bcrypt - Die einbindung von bcrypt, zum ver- und entschlüsseln der Passwörter
	*/
	changeName: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		if (data.user != null && data.pw != null && data.edit != null) {
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
	
	/**
	* Prüft ob das eingegebene Passwort zu dem Benutzernamen passt
	* Das Passwort des entsprechenden Benutzers wird durch das neue Passwort ersetzt
	* Führt sowohl bei einem failed als auch bei einem success die result-Funktion des Servers aus
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param socketid - Die Socket ID des verbundenen Clients
	* @param mongo - Die Datenbankverbindung
	* @param bcrypt - Die einbindung von bcrypt, zum ver- und entschlüsseln der Passwörter
	*/
	changePW: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		if (data.user != null && data.pw != null && data.edit != null) {
			var findUser = function(db, callback) {
				var cursor = db.collection('user').find( { "user": data.user } );
				cursor.each(function(err, doc) {
					if(doc != null) {
						bcrypt.compare(data.pw, doc.pw, function(err, res) {
							if (res == true) {
								if (doc.pw != data.pw) {
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
	
	/**
	* Gibt allen mit einem Raum vebrundenen clients die Benutzernamen der verbundenen Clients zurück
	* Die Socket ID's werden mit der user-Collection abgeglichen und so mit den entsprechenden Benutzernamen verknüpft
	*
	* @param data - Das geparste JavaScript Object welches als JSON durch den Client gesendet wurde
	* @param bcrypt - Ein Array welches die Socket ID's der mit einem Raum verbundenen clients enthält
	* @param mongo - Die Datenbankverbindung
	*/
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
		if (data.user != null) {
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