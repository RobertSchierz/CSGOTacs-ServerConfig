module.exports = {
	
	expireMap: function(msg, mongo) {
		//var mongo = require('../mongodb.js');
		var send = require('../app.js');
		var findMap = function(db, callback) {
			if(msg.user != undefined) {
				var cursor = db.collection('saved').find( { "user": msg.user, 'group': null } );
			} else {
				var cursor = db.collection('saved').find( { "group": msg } );
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
					var updateMaps = function(db, callback) {
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'expireAt': send.setExpire(new Date()) }
							}, function(err, results) {
							callback();
						});
						
					};
					mongo(function(err, db) {
						updateMaps(db, function() {
						});
					});
				} else {
					callback();
				}
			});
		};
		mongo(function(err, db) {
			findMap(db, function() {
			});
		});
	},
	
	expire: function(msg, mongo) {
		//var mongo = require('../mongodb.js');
		var send = require('../app.js');
		var collection = null;
		//stellt sicher das felder nicht leer sind
		//durchsucht die collection 'user' nach passendem benutzer/passwort
		var find = function(db, callback) {
			if(msg.pw != undefined) {
				var cursor = db.collection('user').find( { "user": msg.user } );
				collection = 'user';
			} else {
				var cursor = db.collection('groups').find({ "name": msg })
				collection = 'groups';
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					//gespeicherte socket id des nutzers wird zwecks authentifizierung durch die des aktuell verbundenen clients ersetzt, letzter login wird gesetzt
					var update = function(db, callback) {
						db.collection(collection).updateOne(
							doc,
							{
								$set: { 'expireAt': send.setExpire(new Date()) }
							}, function(err, results) {
							callback();
						});
						
					};
					mongo(function(err, db) {
						update(db, function() {
						});
					});
				} else {
					callback();
				}
			});
		};
		mongo(function(err, db) {
			find(db, function() {
			});
		});
	}
	
}