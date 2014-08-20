var jshint = require('gulp-jshint');
var csslint = require('gulp-csslint');
var stylish = require('jshint-stylish');
var filter = require('gulp-filter');
var globber = require('./all_glob');
var gutil = require('gulp-util');

//Unify look of js and css linters
function csslintreporter(file) {
	//Log the path
	console.log(file.path);

	//Keep our errors without line numbers
	var lineless = [];

	//Iterate over errors
	file.csslint.results.forEach(function(result) {
		//Filter those without line numbers
		if(result.error.line === undefined) {
			lineless.push(result);
		} else {
			console.log(gutil.colors.gray('  line ' + result.error.line + '\t' + 'col ' + result.error.col + '\t') + gutil.colors.blue(result.error.message));
		}
	});

	//Log the ones without lines
	if(lineless.length > 0) {
		console.log('\n  Without line:');
	}
	lineless.forEach(function(result) {
		console.log(gutil.colors.blue('    ' + result.error.message));
	});

	//Log the result
	if(file.csslint.errorCount > 0) {
		console.log('\n' + gutil.colors.red.bold((process.platform !== 'win32' ? '✖ ' : '') + file.csslint.errorCount + ' problem' + (file.csslint.errorCount > 1 ? 's' : '')));
	} else {
		console.log('\n' + gutil.colors.green.bold((process.platform !== 'win32' ? '✔ ' : '') + 'No problems'));
	}

	console.log('\n');
}

//Prepare our globbing
var all = globber();

//Export required functions
module.exports = {
	js: function (gulp) {
		var src = gulp.src(all);

		//JS Files
		return src.pipe(filter('**/*.js'))
			.pipe(jshint())
			.pipe(jshint.reporter(stylish));
	},
	css: function (gulp) {
		var src = gulp.src(all);

		//CSS Files
		return src.pipe(filter('**/*.css'))
			.pipe(csslint())
			.pipe(csslint.reporter(csslintreporter));
	}
};
