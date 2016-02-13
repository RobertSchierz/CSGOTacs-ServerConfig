module.exports = {
	
	//setzt das ablaufdatum eines map-dokuments
	expireTac: function(msg, mongo) {
		var send = require('../service.js');
		var findTac = function(db, callback) {
			if(msg.user != undefined) {
				var cursor = db.collection('saved').find( { "user": msg.user, 'group': null } );
			} else {
				var cursor = db.collection('saved').find( { "group": msg } );
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					db.collection('saved').updateOne(
						doc,
						{
							$set: { 'expireAt': send.setExpire(new Date()) }
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
	
	//setzt das ablaufdatum eines user- oder gruppen-dokuments
	expire: function(msg, mongo) {
		var send = require('../service.js');
		var collection = null;
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
					db.collection(collection).updateOne(
						doc,
						{
							$set: { 'expireAt': send.setExpire(new Date()) }
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