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
			},
			sample:{
				files:{
					'themes/sample/files/theme.js':['themes/sample/files/theme.js']
				}
			}
		},
		imageoptim: {/* @see https://github.com/JamieMason/grunt-imageoptim */ /* "grunt-imageoptim": "~1.4.1", */
			sample: {
				src: ['themes/sample/files/images']
			}
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
			},
			sample:{
				// define the files to lint
				files: ['themes/sample/files/js/*.js']
			}
		},
		watch: {

		},
		"ustudio-theme-upload":{

		}
	};
	//### Add Per-Theme config / targets
	var themes = fs.readdirSync("./themes");
	themes = _.filter(themes, function(theme){
		var fs_stats = fs.statSync("./themes/"+theme);
		return fs_stats.isDirectory();
		}
	);
	//TODO foreach theme in ./themes
	_.each(themes, function(theme){
		//##Add grunt targets to grunt_config

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
			files: ['themes/'+theme+'/files/**'],
			tasks: ['clean:'+theme, 'compress:'+theme ,'ustudio-theme-upload:'+theme],
			options:{
				spawn:false
			}
		};
		//## uStudio Theme Upload
		grunt_config["ustudio-theme-upload"][theme] = {
			theme: theme
		};
	});

	//console.log(util.inspect(grunt_config.watch.iga_test_theme, {colors:true}));

	//## Register Custom Tasks
	//### uStudio Upload Task
	grunt.registerMultiTask('ustudio-theme-upload', 'Perform API requests to upload a compressed theme', function() {
		var uStudio = require("./src/ustudio-theme");
		uStudio.upload_theme(this.target);
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
