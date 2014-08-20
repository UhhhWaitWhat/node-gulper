var filter = require('gulp-filter');
var path = require('path');
var es = require('event-stream');
var handlebars = require('handlebars');
var gutil = require('gulp-util');

module.exports = function (stream, html) {
	var output = es.through();
	var scripts = stream.pipe(filter('**/*.js'));
	var styles = stream.pipe(filter('**/*.css'));

	var regcss = /<!-- \/\/CSS\/\/ -->[\s\S]*<!-- \\\\CSS\\\\ -->/;
	var regjs = /<!-- \/\/JS\/\/ -->[\s\S]*<!-- \\\\JS\\\\ -->/;

	var tmpcss = handlebars.compile('<!-- //CSS// -->{{#each styles}}{{#each this}}<link rel="stylesheet" type="text/css" href="{{this}}">{{/each}}{{/each}}<!-- \\\\CSS\\\\ -->');
	var tmpjs = handlebars.compile('<!-- //JS// -->{{#each scripts}}{{#each this}}<script src="{{this}}"></script>{{/each}}{{/each}}<!-- \\\\JS\\\\ -->');

	var context = {
		scripts: [],
		styles: [],
		html: [],
	};

	//Add scripts to context and trigger rerender
	scripts.on('data', function(data) {
		gutil.log('Changed Script:', gutil.colors.cyan(data.path));
		var rel = path.relative(data.base, data.path);
		var level = (typeof data.level === 'number') ? data.level : 0;

		context.scripts[level] = context.scripts[level] || [];
		if(context.scripts[level].indexOf(rel) === -1) {
			context.scripts[level].push(rel);
			rerender();
		}
	});

	//Add styles to context and trigger rerender
	styles.on('data', function(data) {
		gutil.log('Changed Style:', gutil.colors.cyan(data.path));
		var rel = path.relative(data.base, data.path);
		var level = (typeof data.level === 'number') ? data.level : 0;

		context.styles[level] = context.styles[level] || [];
		if(context.styles[level].indexOf(rel) === -1) {
			context.styles[level].push(rel);
			rerender();
		}
	});

	//Add styles to context and trigger rerender
	html.on('data', function(data) {
		if(data.contents) {
			if(data.contents.toString().match(regcss) || data._contents.toString().match(regjs)) {
				context.html[data.path] = ({h: data, t: render(data, 0)});
			} else {
				output.write(data);
			}
		}
	});

	//Rerender all known html
	function rerender() {
		for(var html in context.html) {
			context.html[html].t = render(context.html[html].h, context.html[html].t);
		}
	}

	//Render one html file
	function render(el, timer) {
		clearTimeout(timer);
		return setTimeout(function() {
			gutil.log('Reinjecting into:', gutil.colors.magenta(path.relative(el.base, el.path)));
			el._contents = new Buffer(el._contents.toString().replace(regcss, tmpcss(context)).replace(regjs, tmpjs(context)));
			output.write(el);
		}, 200);
	}

	//Return our output stream
	return output;
};