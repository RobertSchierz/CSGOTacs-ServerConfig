module.exports = {
	
	/**
	* Erzeugt das Ablaufdatum eines Dokuments
	*
	* @param date - Das aktuelle Datum
	*/
	setExpire: function(date) {
		var DAYS = 90;
		var expireDate = new Date(date.setDate(date.getDate() + DAYS));
		return expireDate;
	},
	
	/**
	* Setzt das Ablaufdatum einer User- oder Gruppentaktik
	* Der value vom key 'expireAt' wird auf das neue Datum (+ 90 Tage) gesetzt
	* Das Dokument wird an diesem Datum automatisch durch die Datenbank gelöscht
	*
	* @param data - Ein Parameter vom Typ JavaScript Object
	* @param mongo - Die Datenbankverbindung
	*/
	expireTac: function(data, mongo) {
		var send = require('../service.js');
		var expire = require('./expire.js');
		var findTac = function(db, callback) {
			if(data.user != undefined) {
				var cursor = db.collection('saved').find( { "user": data.user, "group": null } );
			} else {
				var cursor = db.collection('saved').find( { "group": data } );
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					db.collection('saved').updateOne(
						doc,
						{
							$set: { 'expireAt': expire.setExpire(new Date()) }
						}, function(err, results) {
						callback();
					});
				} else {
					callback();
				}
			});
		};
		mongo(function(err, db) {
			findTac(db, function() {
			});
		});
	},
	
	/**
	* Setzt das Ablaufdatum eines User- oder Gruppendokuments
	* Der value vom key 'expireAt' wird auf das neue Datum (+ 90 Tage) gesetzt
	* Das Dokument wird an diesem Datum automatisch durch die Datenbank gelöscht
	*
	* @param data - Ein Parameter vom Typ JavaScript Object
	* @param mongo - Die Datenbankverbindung
	*/
	expire: function(data, mongo) {
		var send = require('../service.js');
		var expire = require('./expire.js');
		var collection = null;
		var find = function(db, callback) {
			if(data.pw != undefined) {
				var cursor = db.collection('user').find( { "user": data.user } );
				collection = 'user';
			} else {
				var cursor = db.collection('groups').find({ "name": data })
				collection = 'groups';
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					db.collection(collection).updateOne(
						doc,
						{
							$set: { 'expireAt': expire.setExpire(new Date()) }
						}, function(err, results) {
						callback();
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