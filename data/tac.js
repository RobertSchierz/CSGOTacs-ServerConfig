module.exports = {
	
	createTac: function(data, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js')
		if (data.id != null && data.user != null && data.map != null && data.name != null && data.x != null && data.y != null && data.drag != null) {
			var createTac = function(db, callback) {
				var tacs = [];
				var newTac = {
					'id' : data.id,
					'user' : data.user,
					'map' : data.map,
					'name' : data.name,
					'group' : data.group || null,
					'drag' : data.drag || [],
					'x' : data.x || [],
					'y' : data.y || []
				};
				tacs.push(newTac);
				db.collection('saved').insertOne(newTac,
				function(err, result) {
					callback(result);
				});
				
				if(data.group == undefined) {
					expire.expireTac(data, mongo);
				} else {
					expire.expireTac(data.group, mongo);
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
	
	bindTac: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.id != null && data.group != null) {
			var findTac = function(db, callback) {
				var cursor = db.collection('saved').find( { "id": parseInt(data.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'group' : data.group }
							}, function(err, results) {
							callback();
						});
						server.result({
							'status' : 'bindTacSuccess',
							'id' : data.id,
							'group' : data.group
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
	
	changeTac: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.id != null && data.x != null && data.y != null && data.drag != null) {
			var findTac = function(db, callback) {
				var tacs = [];
				var cursor = db.collection('saved').find( { "id": data.id } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						tacs.push({
							'id' : doc.id,
							'user' : doc.user,
							'map' : doc.map, 
							'name' : doc.name,
							'group' : doc.group,
							'drag' : data.drag,
							'x' : data.x,
							'y' : data.y
						});
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'drag' : data.drag, 'x' : data.x, 'y' : data.y }
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
	
	changeTacName: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.id != null && data.name != null) {
			var findTac = function(db, callback) {
				var name;
				var cursor = db.collection('saved').find( { "id": parseInt(data.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						db.collection('saved').updateOne(
							doc,
							{
								$set: { 'name' : data.name }
							}, function(err, results) {
							callback();
						});
						if(doc.group != null) {
							server.result({
								'status' : 'changeTacNameSuccess',
								'id' : data.id,
								'group' : doc.group,
								'name' : data.name
							}, socketid);
						} else {
							server.result({
								'status' : 'changeTacNameSuccess',
								'id' : data.id,
								'name' : data.name
							}, socketid);
						}
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeTacNameFailed'
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
	
	deleteTac: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.id != null) {
			var findTac = function(db, callback) {
				var cursor = db.collection('saved').find( { 'id': parseInt(data.id) } );
				cursor.each(function(err, doc) {
					if (doc != null) {
						db.collection('saved').deleteOne(
							doc
						);
						server.result({
							'status' : 'deleteTacSuccess',
							'id' : data.id
						}, socketid);
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'deleteTacFailed'
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
	
	getTacs: function(data, socketid, mongo) {
		var tacs = [];
		var server = require('../service.js');
		if(data.user != null || data.group != null) {
			var getTacs = function(db, callback) {
				//alle vom benutzer erstellten maps auslesen und in array pushen
				var cursor;
				if (data.user != undefined) {
					cursor = db.collection('saved').find( { "user": data.user } );
				} else if (data.group != undefined) {
					cursor = db.collection('saved').find( { "group": data.group } );
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
		} else {
			server.result({
				'status' : 'provideTacsFailed'
			}, socketid);
		}
	}
};
