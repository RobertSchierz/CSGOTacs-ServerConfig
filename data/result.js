module.exports = {
	setStatus: function(answer) {
		var answer = {
			'status' : answer.status,
			'user' : answer.user || null,
			'kick' : answer.kick || null,
			'member' : answer.member || null,
			'admin' : answer.admin || null,
			'mods' : answer.mods || null,
			'maps' : answer.maps || null,
			'id' : answer.id || null,
			'name' : answer.name || null,
			'group' : answer.group || null,
			'groups' : answer.groups || null,
			'room' : answer.room || null,
			'live' : answer.live || null
		};
		return answer;
	}
	
};