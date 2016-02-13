module.exports = {
	
	createTac: function(msg, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js')
		if ((msg.id != null || msg.id != undefined) && (msg.user != null && msg.user != undefined) && (msg.map != null && msg.map != undefined) && (msg.name != null && msg.name != undefined)) {
			var createTac = function(db, callback) {
				var tacs = [];
				var newTac = {
					'id' : msg.id,
					'user' : msg.user,
					'map' : msg.map,
					'name' : msg.name,
					'group' : msg.group || null,
					'drag' : msg.drag || [],
					'x' : msg.x || [],
					'y' : msg.y || []
				};
				tacs.push(newTac);
				db.collection('saved').insertOne(newTac,
				function(err, result) {
					callback(result);
				});
				
				if(msg.group == undefined) {
					expire.expireTac(msg, mongo);
				} else {
					expire.expireTac(msg.group, mongo);
				}
				
				server.result({
					'status' : 'createTacSuccess',
					'tacs' : tacs
				}, socketid);
				
			};
			mongo(function(err, db) {
				createTac(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'createTacFailed'
			}, socketid);
		}
	},
	
	bindTac: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != null && msg.id != undefined) && (msg.group != null && msg.group != undefined)) {
			var findTac = function(db, callback) {
				var cursor = db.collection('saved').find( { "id": parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'group' : msg.group }
							}, function(err, results) {
							callback();
						});
						server.result({
							'status' : 'bindTacSuccess',
							'id' : msg.id,
							'group' : msg.group
						}, socketid);
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'bindTacFailed'
							
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findTac(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'bindTacFailed'
			}, socketid);
		} 
	},
	
	changeTac: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != null && msg.id != undefined) && (msg.drag != null && msg.drag != undefined) && (msg.x != null && msg.x != undefined) && (msg.y != null && msg.y != undefined)) {
			var findTac = function(db, callback) {
				var tacs = [];
				var cursor = db.collection('saved').find( { "id": msg.id } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						tacs.push({
							'id' : doc.id,
							'user' : doc.user,
							'map' : doc.map, 
							'name' : doc.name,
							'group' : doc.group,
							'drag' : msg.drag,
							'x' : msg.x,
							'y' : msg.y
						});
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'drag' : msg.drag, 'x' : msg.x, 'y' : msg.y }
							}, function(err, results) {
							callback();
						});
						server.result({
							'status' : 'changeTacSuccess',
							'tacs' : tacs
						}, socketid);
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeTacFailed'
						}, socketid);
					}
				});
			};
			mongo(function(err, db) {
				findTac(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'changeTacFailed'
			}, socketid);
		} 
	},
	
	changeTacName: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != '') && (msg.name != '')) {
			var findTac = function(db, callback) {
				var name;
				var cursor = db.collection('saved').find( { "id": parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						name = doc.name;
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'name' : msg.name }
							}, function(err, results) {
							callback();
						});
						server.result({
							'status' : 'changeTacNameSuccess',
							'id' : msg.id,
							'name' : name
						}, socketid);
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeTacNameFailed',
							'id' : msg.id,
							'name' : name
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findTac(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'changeTacNameFailed'
			}, socketid);
		}
	},
	
	deleteTac: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (msg.id != '') {
			var findTac = function(db, callback) {
				var cursor = db.collection('saved').find( { 'id': parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						db.collection('saved').deleteOne(
							doc
						);
						server.result({
							'status' : 'deleteTacSuccess',
							'id' : msg.id
						}, socketid);
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'deleteTacFailed',
							'id' : msg.id
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findTac(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'deleteTacFailed'
			}, socketid);
		} 
	},
	
	getTacs: function(msg, socketid, mongo) {
		var tacs = [];
		var server = require('../service.js');
		var getTacs = function(db, callback) {
			//alle vom benutzer erstellten maps auslesen und in array pushen
			var cursor;
			if (msg.user != undefined) {
				cursor = db.collection('saved').find( { "user": msg.user } );
			} else if (msg.group != undefined) {
				cursor = db.collection('saved').find( { "group": msg.group } );
			}
			cursor.each(function(err, doc) {
				if (doc != null) {
					tacs.push({
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
					server.result({
						'status' : 'provideTacs',
						'tacs' : tacs
					}, socketid);
					callback();
				}
			});
		};
		mongo(function(err, db) {
			getTacs(db, function() {
			});
		});
	}
};
