Easier gulp asset injecting.
============================

This module aims to make compiling and injecting of web development assets (styles, scripts, fonts etc.) easier and more robust. You may instantiate it like this in your `gulpfile.js`:

``` js
var gulp = require('gulp');
var Gulper = require('gulper');
var gulper = new Gulper({
	dest: "build",
	views: {
		src: "assets/views/**",
		dest: "build/views"
	}
});
```

The config object passed to the gulper should have the following parameters:
* `dest`: The destination to write the compiled assets to. Should be served by your server
* `views.src`: A glob expression to match all view files. These files will be injected with the assets
* `views.dest`: A folder to write the views to. Should be your servers view folder


Views
=====
Any views matched by the passed glob, will be copied to the view destination and the following blocks will be replaced with the corresponding script or style blocks:

	<!-- //CSS// --><!-- \\CSS\\ -->
	<!-- //JS// --><!-- \\JS\\ -->


Gulp Tasks
==========
You should attach your instance of `Gulper` to your required `gulp` module like so:

``` js
gulper.attach(gulp);
```

Gulper then registers the following gulp tasks:
* `clean`: Cleans up all generated files (namely the `dest` and `views.dest` folders)
* `build`: Compiles, minifies and reinjects all files into all views
* `watch`: Watches all sources and rebuilds and reinjects only the neccessary files on changes. Should be fast
* `lint`: Lints all CSS and JavaScript files matched by any plugins and outputs the results on the console


Plugins
=======
So how does gulper know which files to process? This is where plugins come in. Plugins may depend on other plugins and gulper will take care of the injections happening in the correct order. A plugin can be registered via the `plugin` method:

``` js
gulper.plugin(pluginObject, dependencies)
```

`dependencies` is an optional paramater and should be an Array filled with the names of the plugins this one should depend on.

pluginObject
------------
* `plugin.name`: A name for the plugin (used for logging and building dependencies). You may register multiple plugins with the same name as long as their output type differs.
* `plugin.output`: The type of files the plugin passes to gulper (currently 'styles', 'scripts' and 'assets' are supported)
* `plugin.glob`: A glob to source files from. This glob should contain relevant files but does not neccessarily have to match only those if that is not possible.
* `plugin.base`: A base path with which to invoke `gulp.src` on the glob.
* `plugin.streamer`: The main plugin function as specified below


### plugin.streamer
This function is the core component of each plugin. It takes an input stream as its only parameter and should return a stream emitting the compiled js, css or asset files.
The input stream is derived from the plugins glob via either `gulp.src` or the `gulp-watch` plugin depending on the run task. Either way, you should start closing your stream as soon as your input stream emitted its `end` event.
Therefore you may simply pipe the input stream through several gulp plugins and return it afterwards. Your plugin should however not concatenate or minify if possible, as gulper will do this for you.

If you cannot specify a glob matching all your source files (because you read them from a `bower.json` which may change e.g.), you may also create your own source stream at runtime. Of course you may also create a stream emitting completely new files (vinyl objects).


Available Plugins
=================
* [static](https://github.com/PaulAvery/sails-gulper-static.git): Simply pass through files
* [bower](https://github.com/PaulAvery/sails-gulper-bower.git): Include files installed with bower
* [component](https://github.com/PaulAvery/sails-gulper-component.git): Include files installed with component
* [browserify](https://github.com/PaulAvery/sails-gulper-browserify.git): Include a browserified javascript file.
* [handlebars](https://github.com/PaulAvery/sails-gulper-handlebars.git): Include handlebars templates
* [sprites](https://github.com/PaulAvery/sails-gulper-sprites.git): Include images as css sprites