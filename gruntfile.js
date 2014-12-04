/** Grunt Build File
 * @author Malcolm Poindexter <malcolm.poindexter@umusic.com>
 * @see http://gruntjs.com/getting-started
 * Note, npm install w/ Livefyre bower fails on Windows. w/ Node 1.4.4+ npm install --ignore-scripts is available & succeeds in Windows CMD.
 */
module.exports = function(grunt) {
	var _ = require("underscore" ),
		fs = require("fs");

	//## Define Grunt Config
	var grunt_config = {
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			sample: ["themes/sample/sample.zip"]
		},
		compress: { /* @see https://github.com/gruntjs/grunt-contrib-compress */
			//TODO create a destination per theme directory
			sample: {
				options: {
					archive: 'sample.zip'
				},
				files: [
					{ src: ['themes/sample/files/**'], dest: 'themes/sample/', filter: 'isFile' }
				]
			}
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
			main:{
				files: ['<%= jshint.files %>'],
				tasks: ['concat']
			}
		}
	};
	//### Add Per-Theme config / targets
	var themes = fs.readdirSync("./themes");
	//TODO foreach theme in ./themes
	for( var theme in themes){
		//and add grunt targets to grunt_config
		grunt_config.compress[theme] = {
			options: {
				archive: theme+'.zip'
			},
			files: [
				{ src: ['themes/'+theme+'/files/**'], dest: 'themes/'+theme+'/', filter: 'isFile' }
			]
		};
	}

	//### Set the default task
	var target = grunt.option("target");
	if(target === ""){
		grunt.option("target", "default");
	}
	grunt.initConfig(grunt_config);

	//## Load Tasks
	//### Build
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//### Debug
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//### Watch
	grunt.loadNpmTasks('grunt-contrib-watch');

	//### uStudio Deploy
	grunt.registerMultiTask('ustudio-theme-deploy', 'Perform API requests to upload a compressed theme', function() {
		var uStudio = require("./src/ustudio-theme");
		var target = grunt.option('target');
		uStudio.deploy_theme(target);
	});

	//## Register Grunt Tacks
	//ustudio-theme watch -t <theme> -d <destination>
	//ustudio-theme build -t <theme>
	grunt.registerTask('build', ['clean', /*'uglify'*/, 'compress']);
	//ustudio-theme debug -t <theme>
	grunt.registerTask('debug', ['jshint']);
	//ustudio-theme deploy -t <theme> -d <destination>
	grunt.registerTask('deploy', [ 'clean', /*'uglify'*/, 'compress', 'ustudio-theme-deploy']);

};
