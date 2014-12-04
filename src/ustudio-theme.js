/**
 * Command line interface for jccs Janrain Capture Client Settings module
 * @file ustudio-theme.js
 */
function ustudio_theme(options){
	var _ = require('underscore' ),
		fs = require("fs"),
		util = require("util"),
		colors = require('colors'),
		stream = require("stream");

	var argv = require('optimist')
		.usage('Usage: $0 <method> t [theme] --debug ')
		.demand(['t'])
		.alias('t','theme')
		.describe('t','uStudio Theme name')
		.alias('d','debug')
		.describe('d','debug flag, debug messages in console')
		.boolean('t')
		.argv;


	var grunt = require("grunt");
	grunt.cli({
		gruntfile: "./gruntfile.js",
		target: "<THEME NAME>"
	});

}

ustudio_theme.deploy_theme = function(){

};

if(process.argv && process.argv.length > 2){// If invoked from the commandline
	if(process.argv[1].indexOf("ustudio-theme") > -1 ){
		ustudio_theme({});
	}
}

module.exports = ustudio_theme;
