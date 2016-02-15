module.exports = {
	
	//setzt das ablaufdatum eines map-dokuments
	expireTac: function(data, mongo) {
		var send = require('../service.js');
		var findTac = function(db, callback) {
			if(data.user != undefined) {
				var cursor = db.collection('saved').find( { "user": data.user, 'group': null } );
			} else {
				var cursor = db.collection('saved').find( { "group": data } );
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
	expire: function(data, mongo) {
		var send = require('../service.js');
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