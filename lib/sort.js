module.exports = function sort() {
	var buffer = [];
	return es.through(function(data) {
		buffer[data.level] = buffer[data.level] || [];
		buffer[data.level].push(data);
	}, function() {
		var self = this;

		buffer.forEach(function(level) {
			level.forEach(function(data) {
				self.emit('data', data);
			});
		});

		this.emit('end');
	});
}
