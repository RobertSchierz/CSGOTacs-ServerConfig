module.exports = {
	
	createMap: function(msg, socketid, mongo) {
		var server = require('../app.js');
		var expire = require('./expire.js')
		if ((msg.id != null || msg.id != undefined) && (msg.user != null && msg.user != undefined) && (msg.map != null && msg.map != undefined) && (msg.name != null && msg.name != undefined)) {
			var createMap = function(db, callback) {
				var maps = [];
				var newMap = {
					'id' : msg.id,
					'user' : msg.user,
					'map' : msg.map,
					'name' : msg.name,
					'group' : msg.group || null,
					'drag' : msg.drag || [],
					'x' : msg.x || [],
					'y' : msg.y || []
				};
				maps.push(newMap);
				db.collection('saved').insertOne(newMap,
				function(err, result) {
					mongo.assert.equal(err, null);
					callback(result);
				});
				
				if(msg.group == undefined) {
					expire.expireMap(msg, mongo);
				} else {
					expire.expireMap(msg.group, mongo);
				}
				
				server.result({
					'status' : 'createMapSuccess',
					'maps' : maps
				}, socketid);
				
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				createMap(db, function() {
					db.close();
				});
			});
		} else {
			server.result({
				'status' : 'createMapFailed'
			}, socketid);
		}
	},
	
	bindMap: function(msg, socketid, mongo) {
		var server = require('../app.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != null && msg.id != undefined) && (msg.group != null && msg.group != undefined)) {
			var findMap = function(db, callback) {
				var cursor = db.collection('saved').find( { "id": parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					mongo.assert.equal(err, null);
					if (doc != null) {
						var bindMap = function(db, callback) {
							db.collection('saved').updateOne(
								doc,
								{
									$set: { 'group' : msg.group }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'bindMapSuccess',
								'id' : msg.id,
								'group' : msg.group
							}, socketid);
						};
						mongo.MongoClient.connect(mongo.url, function(err, db) {
							mongo.assert.equal(null, err);
							bindMap(db, function() {
								db.close();
							});
						});
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'bindMapFailed'
							
						}, socketid);
						console.log('fehler 1. else');
						callback();
					}
				});
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			server.result({
				'status' : 'bindMapFailed'
			}, socketid);
			console.log('fehler 2. else');
		} 
	},
	
	changeMap: function(msg, socketid, mongo) {
		var server = require('../app.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != null && msg.id != undefined) && (msg.drag != null && msg.drag != undefined) && (msg.x != null && msg.x != undefined) && (msg.y != null && msg.y != undefined)) {
			var findMap = function(db, callback) {
				var maps = [];
				var cursor = db.collection('saved').find( { "id": msg.id } );
				cursor.each(function(err, doc) {
					mongo.assert.equal(err, null);
					if (doc != null) {
						var updateXY = function(db, callback) {
							maps.push(doc);
							db.collection('saved').updateOne(
								doc,
								{
									$set: { 'drag' : msg.drag, 'x' : msg.x, 'y' : msg.y }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'changeMapSuccess',
								'maps' : maps
							}, socketid);
						};
						mongo.MongoClient.connect(mongo.url, function(err, db) {
							mongo.assert.equal(null, err);
							updateXY(db, function() {
								db.close();
							});
						});
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeMapFailed'
						}, socketid);
					}
				});
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			server.result({
				'status' : 'changeMapFailed'
			}, socketid);
		} 
	},
	
	changeMapName: function(msg, socketid, mongo) {
		var server = require('../app.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.id != '') && (msg.name != '')) {
			var findMap = function(db, callback) {
				var name;
				var cursor = db.collection('saved').find( { "id": parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					mongo.assert.equal(err, null);
					if (doc != null) {
						name = doc.name;
						var updateName = function(db, callback) {
							db.collection('saved').updateOne(
								doc,
								{
									$set: { 'name' : msg.name }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'changeMapNameSuccess',
								'id' : msg.id,
								'name' : name
							}, socketid);
						};
						mongo.MongoClient.connect(mongo.url, function(err, db) {
							mongo.assert.equal(null, err);
							updateName(db, function() {
								db.close();
							});
						});
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'changeMapNameFailed',
							'id' : msg.id,
							'name' : name
						}, socketid);
						callback();
					}
				});
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			server.result({
				'status' : 'changeMapNameFailed'
			}, socketid);
		}
	},
	
	deleteMap: function(msg, socketid, mongo) {
		var server = require('../app.js');
		//stellt sicher das felder nicht leer sind
		if (msg.id != '') {
			var findMap = function(db, callback) {
				var cursor = db.collection('saved').find( { 'id': parseInt(msg.id) } );
				cursor.each(function(err, doc) {
					mongo.assert.equal(err, null);
					if (doc != null) {
						var deleteMap = function(db, callback) {
							db.collection('saved').deleteOne(
								doc
							);
							server.result({
								'status' : 'deleteMapSuccess',
								'id' : msg.id
							}, socketid);
						};
						mongo.MongoClient.connect(mongo.url, function(err, db) {
							mongo.assert.equal(null, err);
							deleteMap(db, function() {
								db.close();
							});
						});
					} else if (cursor[0] != null) {
						server.result({
							'status' : 'deleteMapFailed',
							'id' : msg.id
						}, socketid);
						callback();
					}
				});
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				findMap(db, function() {
					db.close();
				});
			});
		} else {
			server.result({
				'status' : 'deleteMapFailed'
			}, socketid);
		} 
	},
	
	getMaps: function(msg, socketid, mongo) {
		var maps = [];
		var server = require('../app.js');
		var getMaps = function(db, callback) {
			//alle vom benutzer erstellten maps auslesen und in array pushen
			var findMaps = function(db, callback) {
				var cursor;
				if (msg.user != undefined) {
					cursor = db.collection('saved').find( { "user": msg.user } );
				} else if (msg.group != undefined) {
					cursor = db.collection('saved').find( { "group": msg.group } );
				}
				cursor.each(function(err, doc) {
					mongo.assert.equal(err, null);
					if (doc != null) {
						maps.push({
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
							'status' : 'provideMaps',
							'maps' : maps
						}, socketid);
						callback();
					}
				});
			};
			mongo.MongoClient.connect(mongo.url, function(err, db) {
				mongo.assert.equal(null, err);
				findMaps(db, function() {
					db.close();
				});
			});
		};
		mongo.MongoClient.connect(mongo.url, function(err, db) {
			mongo.assert.equal(null, err);
			getMaps(db, function() {
				db.close();
			});
		});
	}
};