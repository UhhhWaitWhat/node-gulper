var lint = require('./lib/linting');
var inject = require('./lib/inject');
var sort = require('./lib/sort');
var docs = require('./lib/docs');
var globber = require('./lib/all_glob');
var es = require('event-stream');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var prefix = require('gulp-autoprefixer');

var Tasker = require('./gulp/lib/tasker');

function Gulper(config) {
	this.config = config;
	this.tasker = new Tasker();
}

Gulper.prototype.attach = function(gulp) {
	var self = this;
	this.gulp = gulp;

	//Clean all created files
	gulp.task('clean', function() {
		var dest = gulp.src(self.config.dest)
			.pipe(clean({force: true}));

		var views = gulp.src(self.config.views.dest)
			.pipe(clean({force: true}));

		return es.merge(dest, views);
	});

	//Watch all and execute as needed
	gulp.task('watch', ['clean'], function() {
		var scripts = self.tasker.watch('scripts');
		var styles = self.tasker.watch('styles').pipe(prefix());
		var assets = self.tasker.watch('assets');

		//Merge all streams and pipe them to our destination
		var all = es.merge(scripts, styles, assets).pipe(gulp.dest(self.config.dest));

		//Run our injection code
		inject(all, watch({glob: self.config.views.src}))
			.pipe(gulp.dest(self.config.views.dest));
	});

	//Compile into as few files as possible
	gulp.task('build', ['clean'], function() {
		var scripts = self.tasker.get('scripts')
			.pipe(sort())
			.pipe(concat('bundle.js'))
			.pipe(uglify());

		var styles = self.tasker.get('styles')
			.pipe(sort())
			.pipe(prefix())
			.pipe(concat('bundle.css'))
			.pipe(minify());

		var assets = self.tasker.get('assets');

		//Merge all streams and pipe them to our destination
		var all = es.merge(scripts, styles, assets)
			.pipe(gulp.dest(self.config.dest));

		//Run our injection code
		inject(all, gulp.src(self.config.views.src))
			.pipe(gulp.dest(self.config.views.dest));
	});

	//Lint all files, and spit out results
	gulp.task('lint', function(cb) {
		var js = lint.js();
		js.on('end', function() {
			var css = lint.css();
			css.on('end', cb.bind(null, null));
		});
	});

	//Generate documentation
	gulp.task('docs', function() {
		gulp.src(globber())
			.pipe(docs(self.config.docs.theme, self.config.docs.tutorials))
			.pipe(gulp.dest(self.config.docs.dest));
	});
};

Gulper.prototype.plugin = function(plugin, dependencies) {
	this.tasker.task(plugin.name, plugin.output, plugin.glob, plugin.streamer, plugin.base, dependencies);
};

module.exports = Gulper;
