var tsort = require('tsort');
var es = require('event-stream');

function Tasker() {
	this.graphs = {};
}

Tasker.prototype.task = function(name, output, glob, streamer, base, deps) {
	this[output] = this[output] || [];
	this[output].push({
		streamer: streamer,
		glob: glob,
		name: name,
		base: base
	});
	deps.unshift(name);
	this.graphs[output] = this.graphs[output] || tsort();
	this.graphs[output].add.apply(this.graphs[output], deps);
};

Tasker.prototype.get = function(name) {
	var self = this;
	this[name] = this[name] || [];
	var stream = es.merge.apply(es, this[name].map(function(el) {
		gutil.log('Started ', gutil.colors.cyan(el.name + ' - ' + name));
		return el.streamer(gulp.src(el.glob, {base: el.base})).pipe(self.level(name, el.name));
	}));

	return stream;
};

Tasker.prototype.watch = function(name) {
	var self = this;
	this[name] = this[name] || [];
	var stream = es.merge.apply(es, this[name].map(function(el) {
		gutil.log('Started watching', gutil.colors.cyan(el.name + ' - ' + name));
		return el.streamer(watch({glob: el.glob, base: el.base})).pipe(self.level(name, el.name));
	}));

	return stream;
};

Tasker.prototype.level = function(output, name) {
	var self = this;
	return es.through(function(data) {
		var sorted = self.graphs[output].sort();
		data.level = sorted.length - sorted.indexOf();
		this.emit('data', data);
	});
};

module.exports = Tasker;
