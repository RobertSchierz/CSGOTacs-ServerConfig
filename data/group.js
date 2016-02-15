module.exports = {
	
	createGroup: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.pw != null) {
			var createGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				cursor.count(function(err, doc) {
					if (doc == 0) {
						var member = [];
						var mods = [];
						member.push(data.user);
						bcrypt.genSalt(10, function(err, salt) {
							bcrypt.hash(data.pw, salt, function(err, hash) {
								db.collection('groups').insertOne( {
									'name' : data.name,
									'pw' : hash,
									'member' : member,
									'admin' : data.user,
									'mods' : mods
								},
								function(err, result) {
									callback(result);
								});
								expire.expire(data.name, mongo);
								server.result({
									'status' : 'createGroupSuccess',
									'group' : data.name,
									'user' : data.user
								}, socketid);
							});
						});
					} else {
						server.result({
							'status' : 'createGroupFailed'
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
	
	authGroup: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		var group = require('./group.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.pw != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				var validGroup;
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch nicht eingetragen wurde
					if(doc != null) {
						validGroup = true;
						if (doc.member.indexOf(data.user) <= -1) {
							bcrypt.compare(data.pw, doc.pw, function(err, res) {
								if (res == true) {
									//user wird in 'member' array eingetragen
									db.collection('groups').updateOne(
										doc,
										{
											$push: { member: data.user }
										}, function(err, results) {
										callback();
									});
									group.getGroups({'user': data.user, 'authGroup': true}, socketid, mongo);
									/*
									server.result({
										'status' : 'authGroupSuccess',
										'member' : doc.member,
										'admin' : doc.admin,
										'mods' : doc.mods
									}, socketid)
									*/
								} else {
									server.result({
										'status' : 'authGroupFailed'
									}, socketid);
								}
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'authGroupFailed'
							}, socketid);
						}
					} else {
						if(validGroup == null) {
							server.result({
								'status' : 'authGroupFailed'
							}, socketid);
						}
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
	
	getGroups: function(data, socketid, mongo) {
		var server = require('../service.js');
		var expire = require('./expire.js');
		var group = require('./group.js');
		var groups = [];
		if(data.user != null) {
			var getGroups = function(db, callback) {
				var cursor = db.collection('groups').find({ "member": data.user })
				cursor.each(function(err, doc) {
					if (doc != null) {
						groups.push({
							'name' : doc.name,
							'member' : doc.member,
							'admin' : doc.admin,
							'mods' : doc.mods
						});
						expire.expireTac(doc.name, mongo);
						expire.expire(doc.name, mongo);
					} else {
						if(data.deleteAccount == undefined) {
							var status;
							if(data.authGroup == undefined) {
								status = 'provideGroups';
							} else {
								status = 'authGroupSuccess';
							}
							server.result({
								'status' : status,
								'groups' : groups
							}, socketid);
							callback();
						} else {
							groups.forEach(function(i) {
								group.leaveGroup({'name': i.name, 'user': data.user, 'deleteAccount': true}, socketid, mongo);
							});
						}
						callback();
					}
				});
			};
			mongo(function(err, db) {
				getGroups(db, function() {
				});
			});
		} else {
			server.result({
				'status' : 'getGroupsFailed'
			}, socketid);
		}
	},
	
	leaveGroup: function(data, socketid, mongo) {
		var server = require('../service.js');
		var group = require('./group.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.user != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user ein mitglied ist
					if(doc != null) {
						if (doc.member.indexOf(data.user) > -1) {
							//user wird aus 'member' array entfernt
							if(doc.member.length == 1) {
								group.deleteGroup({'name': data.name, 'user': data.user}, socketid, mongo);
							} else {
								db.collection('groups').updateOne(
									doc,
									{
										$pull: { member: data.user, mods: data.user }
									}, function(err, results) {
									callback();
								});
								if(data.deleteAccount == undefined) {
									server.result({
										'status' : 'leaveGroupSuccess',
										'group' : data.name,
										'user' : data.user
									}, socketid);
								} else {
									callback();
								}
							}
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'leaveGroupFailed'
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
	
	setGroupMod: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.user != null && data.set != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if (doc.mods.indexOf(data.user) > -1 || doc.admin == data.user) {
							//user wird in 'mods' array eingetragen
							db.collection('groups').updateOne(
								doc,
								{
									$push: { mods: data.set }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'setGroupModSuccess',
								'user' : data.set,
								'group' : data.name
							}, socketid);
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'setGroupModFailed'
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
	
	unsetGroupMod: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.user != null && data.unset != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if (doc.mods.indexOf(data.user) > -1 || doc.admin == data.user) {
							//user wird in 'mods' array eingetragen
							db.collection('groups').updateOne(
								doc,
								{
									$pull: { mods: data.unset }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'unsetGroupModSuccess',
								'user' : data.unset,
								'group' : data.name
							}, socketid);
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'unsetGroupModFailed'
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
	
	kickUser: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.user != null && data.name != null && data.kick != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				cursor.each(function(err, doc) {
					//prüft ob gruppe existiert und stellt sicher das der user noch kein mod ist
					if(doc != null) {
						if ((doc.admin == data.user) || (doc.mods.indexOf(data.user) > -1)) {
							//user wird aus gruppe entfernt
							db.collection('groups').updateOne(
								doc,
								{
									$pull: { member: data.kick, mods: data.kick }
								}, function(err, results) {
								callback();
							});
							server.result({
								'status' : 'kickUserSuccess',
								'group' : data.name,
								'kick' : data.kick
							}, socketid);
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'kickUserFailed'
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
	
	deleteGroup: function(data, socketid, mongo) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.user != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				var cursorTacs = db.collection('saved').find( { 'group': data.name} );
				cursor.each(function(err, doc) {
					if(doc != null) {
						if (doc.admin == data.user) {
							db.collection('groups').deleteOne(doc);
							server.result({
								'status' : 'deleteGroupSuccess',
								'user' : data.user,
								'group' : data.name
							}, socketid);
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'deleteGroupFailed'
							}, socketid);
						}
					} else {
						callback();
					}
				});
				cursorTacs.each(function(err, docTac) {
					db.collection('saved').deleteOne(docTac);
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
	
	/*DELETEGROUP MIT PASSWORT
	deleteGroup: function(data, socketid, mongo, bcrypt) {
		var server = require('../service.js');
		//stellt sicher das felder nicht leer sind
		if (data.name != null && data.user != null && data.pw != null) {
			//durchsucht die collection 'groups' nach der entsprechenden gruppe
			var findGroup = function(db, callback) {
				var cursor = db.collection('groups').find( { "name": data.name } );
				var cursorTacs = db.collection('saved').find( { 'group': data.name} );
				cursor.each(function(err, doc) {
					if(doc != null) {
						if (doc.admin.indexOf(data.user) > -1) {
							bcrypt.compare(data.pw, doc.pw, function(err, res) {
								if(res == true) {
									db.collection('groups').deleteOne(doc);
									if(data.lastUser == undefined) {
										server.result({
											'status' : 'deleteGroupSuccess',
											'user' : data.user,
											'group' : data.name
										}, socketid);
									}
								} else {
									server.result({
										'status' : 'deleteGroupFailed'
									}, socketid);
								}
							});
						} else if (cursor[0] != null) {
							server.result({
								'status' : 'deleteGroupFailed'
							}, socketid);
						}
					} else {
						callback();
					}
				});
				cursorTacs.each(function(err, docTac) {
					db.collection('saved').deleteOne(docTac);
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
	*/
	
};