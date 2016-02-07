module.exports = {
	provide: function(socketid, mongo) {
		var server = require('../service.js');
		var result = {};
		var countAll = function(db, callback) {
			result = {
				'user' : db.collection('user').count(),
				'group' : db.collection('groups').count(),
				'map' : db.collection('saved').count()
			};
			console.log(result);
			server.sendStats(result, socketid);
		};
		mongo(function(err, db) {
			countAll(db, function() {
			});
		});
	}
}