module.exports = {
	
	createGroup: function(msg, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		console.log(msg);
		if ((msg.name != '') && (msg.pw != '')) {
			var createGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						var member = [];
						var mods = [];
						member.push(msg.user);
						db.collection('groups').insertOne( {
							'name' : msg.name,
							'pw' : msg.pw,
							'member' : member,
							'admin' : msg.user,
							'mods' : mods
						},
						function(err, result) {
							callback(result);
						});
						expire.expire(msg.name, mongo);
						server.result({
							'status' : 'createGroupSuccess',
							'group' : msg.name,
							'user' : msg.user
						}, socketid);
					} else {
						server.result({
							'status' : 'createGroupFailed',
							'group' : msg.name,
							'user' : msg.user
						}, socketid);
					}
				});
			};
			mongo(function(err, db) {
				createGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'createGroupFailed'
			}, socketid);
		}
	},
	
	authGroup: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.pw != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch nicht eingetragen wurde
					if(doc != null) {
						if (doc.member.indexOf(msg.user) <= -1) {
							if (doc.pw != msg.pw) {
								server.result({
									'status' : 'authGroupFailed'
								}, socketid);
							} else {
								//user wird in 'member' array eingetragen
								var updateMember = function(db, callback) {
									db.collection('groups').updateOne(
										doc,
										{
											$push: { member: msg.user }
										}, function(err, results) {
										callback();
									});
									server.result({
										'status' : 'authGroupSuccess',
										'member' : doc.member,
										'admin' : doc.admin,
										'mods' : doc.mods
									}, socketid)
								};
								mongo(function(err, db) {
									updateMember(db, function() {
									});
								});
							}
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'authGroupFailed'
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'authGroupFailed'
			}, socketid);
		} 
	},
	
	getGroups: function(msg, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		var groups = [];
		var getGroups = function(db, callback) {
			var findGroups = function(db, callback) {
				var cursor = db.collection('groups').find({ "member": msg.user })
				cursor.each(function(err, doc) {
					if (doc != null) {
						groups.push({
							'name' : doc.name,
							'member' : doc.member,
							'admin' : doc.admin,
							'mods' : doc.mods
						});
						expire.expireMap(doc.name, mongo);
						expire.expire(doc.name, mongo);
					} else {
						server.result({
							'status' : 'provideGroups',
							'groups' : groups
						}, socketid);
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroups(db, function() {
				});
			});
		};
		mongo(function(err, db) {
			getGroups(db, function() {
			});
		});
	},
	
	leaveGroup: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user ein mitglied ist
					if(doc != null) {
						if (doc.member.indexOf(msg.user) > -1) {
							//user wird aus 'member' array entfernt
							var updateMember = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { member: msg.user }
									}, function(err, results) {
									callback();
								});
								server.result({
									'status' : 'leaveGroupSuccess',
									'group' : msg.name,
									'user' : msg.user
								}, socketid);
							};
							mongo(function(err, db) {
								updateMember(db, function() {
								});
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'leaveGroupFailed',
								'group' : msg.name,
								'user' : msg.user
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'leaveGroupFailed'
			}, socketid);
		} 
	},
	
	setGroupMod: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if (doc.mods.indexOf(msg.user) <= -1) {
							//user wird in 'mods' array eingetragen
							var updateMods = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$push: { mods: msg.user }
									}, function(err, results) {
									callback();
								});
								server.result({
									'status' : 'setGroupModSuccess',
									'user' : msg.user,
									'group' : msg.name
								}, socketid);
							};
							mongo(function(err, db) {
								updateMods(db, function() {
								});
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'setGroupModFailed',
								'user' : msg.user,
								'group' : msg.name
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'setGroupModFailed'
			}, socketid);
		} 
	},
	
	unsetGroupMod: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if (doc.mods.indexOf(msg.user) > -1) {
							//user wird in 'mods' array eingetragen
							var updateMods = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { mods: msg.user }
									}, function(err, results) {
									callback();
								});
								server.result({
									'status' : 'unsetGroupModSuccess',
									'user' : msg.user,
									'group' : msg.name
								}, socketid);
							};
							mongo(function(err, db) {
								updateMods(db, function() {
								});
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'unsetGroupModFailed',
								'user' : msg.user,
								'group' : msg.name
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'unsetGroupModFailed'
			}, socketid);
		} 
	},
	
	kickUser: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.user != '') && (msg.name != '') && (msg.kick != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if ((doc.admin == msg.user) || (doc.mods.indexOf(msg.user) > -1)) {
							//user wird aus gruppe entfernt
							var updateMember = function(db, callback) {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { member: msg.kick }
									}, function(err, results) {
									callback();
								});
								if (doc.mods.indexOf(msg.kick) > -1) {
									db.collection('groups').updateOne(
										doc,
										{
											$pull: { mods: msg.kick }
										}, function(err, results) {
										callback();
									});
								}
								server.result({
									'status' : 'kickUserSuccess',
									'group' : msg.name,
									'kick' : msg.kick
								}, socketid);
							};
							mongo(function(err, db) {
								updateMember(db, function() {
								});
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'kickUserFailed',
								'group' : msg.name,
								'kick' : msg.kick
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'kickUserFailed'
			}, socketid);
		} 
	},
	
	deleteGroup: function(msg, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if ((msg.name != '') && (msg.user != '')) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": msg.name } );
				cursor.each(function(err, doc) {
					if(doc != null) {
						if (doc.admin.indexOf(msg.user) > -1) {
							var deleteGroup = function(db, callback) {
								db.collection('groups').deleteOne(
									doc);
								};
								server.result({
									'status' : 'deleteGroupSuccess',
									'user' : msg.user,
									'group' : msg.name
								}, socketid);
							mongo(function(err, db) {
								deleteGroup(db, function() {
								});
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'deleteGroupFailed',
								'user' : msg.user,
								'group' : msg.name
							}, socketid);
						}
					} else {
						callback();
					}
				});
			};
			mongo(function(err, db) {
				findGroup(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'deleteGroupFailed'
			}, socketid);
		} 
	}
	
};