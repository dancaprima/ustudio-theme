/** Grunt Build File
 * @author Malcolm Poindexter <malcolm.poindexter@umusic.com>
 * @see http://gruntjs.com/getting-started
 * Note, npm install w/ Livefyre bower fails on Windows. w/ Node 1.4.4+ npm install --ignore-scripts is available & succeeds in Windows CMD.
 */
module.exports = function(grunt) {
	var _ = require("underscore" ),
		fs = require("fs" ),
		util = require("util");

	//## Define Grunt Config
	var grunt_config = {
		pkg: grunt.file.readJSON('package.json'),
		clean: {

		},
		compress: { /* @see https://github.com/gruntjs/grunt-contrib-compress */

		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> build-<%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
		},
		imageoptim: {/* @see https://github.com/JamieMason/grunt-imageoptim */ /* "grunt-imageoptim": "~1.4.1", */

		},
		jshint: {
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true,
					smarttabs: true
				}
			}
		},
		watch: {

		},
		"ustudio-theme-upload":{

		},
		"ustudio-module-upload":{

		}
	};
	//### Add Per-Theme config / targets
	var themes = fs.readdirSync("./themes");
	themes = _.filter(themes, function(theme){
		var fs_stats = fs.statSync("./themes/"+theme);
		return fs_stats.isDirectory();
		}
	);

	//Add Grunt targets for themes to grunt_config
	_.each(themes, function(theme){
		//foreach theme in ./themes
		//## Clean
		grunt_config.clean[theme] = ["themes/"+theme+"/"+theme+".zip"];
		//### Compress
		grunt_config.compress[theme] = {
			options: {
				archive: 'themes/'+theme+'/'+theme+'.zip'
			},
			files: [
				{ expand:true, cwd: 'themes/'+theme+'/files/', src: [ 'template.html', 'main.css', 'static/**'], filter: 'isFile' }
			]
		};
		//## Watch
		grunt_config.watch[theme] = {
			files: ['themes/'+theme+'/files/**', 'themes/'+theme+'/test/*.html'],
			tasks: ['clean:'+theme, 'compress:'+theme ,'ustudio-theme-upload:'+theme],
			options:{
				spawn:false,
				livereload:true
			}
		};
		//## uStudio Theme Upload
		grunt_config["ustudio-theme-upload"][theme] = {
			theme: theme
		};
		//## Uglify
		grunt_config.uglify[theme] = {
			files:{
				src: 'themes/'+theme+'/files/static/js/*',
				dest: 'themes/'+theme+'/files/static/js'+theme+'.min.js'
			}
		};

		//## JSHint
		grunt_config.jshint[theme] = {
			files: ['themes/'+theme+'/files/static/**.js']
		};
		//## ImageOptim
		grunt_config.imageoptim[theme] = {
			src: ['themes/'+theme+'/files/static/images/*']
		};
	});

	//Add Grunt targets for modules
	var modules = fs.readdirSync("./modules");
	modules = _.filter(modules, function(module){
			var fs_stats = fs.statSync("./modules/"+module);
			return fs_stats.isDirectory();
		}
	);
	_.each(modules, function(module){
		//## Clean
		grunt_config.clean[module] = ["modules/"+module+"/"+module+".zip"];
		//## uStudio Theme Upload
		grunt_config["ustudio-module-upload"][module] = {
			module: module
		};

		//## Uglify
		grunt_config.uglify[module] = {
			files:{
				src: 'modules/'+module+'/'+module+'.js',
				dest: 'modules/'+module+'/'+module+'.min.js'
			}
		};

		//## JSHint
		grunt_config.jshint[module] = {
			files: ['modules/'+module+'/**.js']
		};

		//## Watch
		grunt_config.watch[module] = {
			files: ['modules/'+module+'/**'],
			tasks: ['clean:'+module ,'ustudio-module-upload:'+module],
			options:{
				spawn:false
			}
		};
	});

	//console.log(util.inspect(grunt_config.watch.iga_test_theme, {colors:true}));

	//## Register Custom Tasks
	//### uStudio Upload Task
	grunt.registerMultiTask('ustudio-theme-upload', 'Perform API requests to upload a compressed theme', function() {
		var uStudio = require("./src/ustudio-theme");
		var done = this.async();
		uStudio.upload_theme(this.target, done);
	});
	grunt.registerMultiTask('ustudio-module-upload', 'Perform API requests to upload a compressed module', function() {
		var uStudio = require("./src/ustudio-theme");
		var done = this.async();
		uStudio.upload_player_module(this.target, done);
	});

	//## Load Tasks
	//### Build
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//### Debug
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//### Watch
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig(grunt_config);
};
