#! /usr/bin/env node
/**
 * Command line interface for jccs Janrain Capture Client Settings module
 * @file ustudio-theme.js
 */

var _ = require('underscore' ),
	fs = require("fs"),
	util = require("util"),
	colors = require('colors'),
	stream = require("stream" ),
	https = require('https'),
	querystring = require('querystring'),
	formData = require('form-data' );

_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g
};

colors.setTheme({
	info: 'green',
	data: 'grey',
	msg: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'cyan',
	error: 'red'
});

//Configuration Constants
var config = require('./config.json');

if(config.studio_uid === "" || config.access_token === ""){
	console.error("ERROR Please fill out the studio uid and access token in config.json".error);
	return;
}

var uStudioAPIEndpoints = {
	BASE_URL: "/api/v2/studios/" + config.studio_uid + "/",
	themes: function(){
		//url to list / add themes
		return uStudioAPIEndpoints.BASE_URL + "player_themes";
	},
	theme: function(theme_id){
		//url to list / add themes
		return uStudioAPIEndpoints.themes() + "/" + theme_id;
	},
	destinations: function(){
		//list destinations
		return uStudioAPIEndpoints.BASE_URL + "destinations";
	},
	destination: function(destination_id){
		//url to add a theme to a destination
		return uStudioAPIEndpoints.destinations()+"/"+destination_id;
	},
	destination_player_modules: function(destination_id){
		//url to add a theme to a destination
		return uStudioAPIEndpoints.destination(destination_id)+"/player_modules";
	},
	modules: function(){
		//url to list / add themes
		return uStudioAPIEndpoints.BASE_URL + "player_modules";
	},
	module: function(player_module_id){
		//url to list / add themes
		return uStudioAPIEndpoints.modules() + "/" + player_module_id;
	},
};

var DEBUG = false,//TODO allow parameter / require
	TEST = false;

//## Command Line Interface
function ustudio_theme(options){
	"use strict";
	var opts = require('optimist')
		.usage('Usage: $0 <method> -t [theme name] -t [destination uid] --debug --test')
		.demand(['$0'])
		.alias('t','theme')
		.describe('t','uStudio Theme name')
		.alias('m','module')
		.describe('m','uStudio Player Module name')
		.alias('d','destination')
		.describe('d','uStudio Destination uid')
		.alias('b','debug')
		.describe('b','debug flag, debug messages in console')
		.boolean('b' )
		.alias('e', 'test')
		.describe('e','test flag, do not make api requests')
		.boolean('e' ),
		argv = opts.argv;

	var method = _.first(argv._ ),
		theme = argv.theme,
		module = argv.module,
		destination = argv.destination;
	DEBUG = argv.debug;
	TEST = argv.test;

	if(!method){
		console.error( "ERROR a method is required".error );
		opts.showHelp();
		return;
	}
	//### Call the appropriate method

	switch(method){
		case "create":
			if(DEBUG){ console.log("CALL create_theme: ".debug + theme); }
			if(!theme){
				console.error("ERROR a theme must be provided using the -t [theme] option".error);
				return;
			}
			ustudio_theme.create_theme(theme);
			break;
		case "delete":
			if(DEBUG){ console.log("CALL create_theme: ".debug + theme); }
			if(!theme){
				console.error("ERROR a theme must be provided using the -t [theme] option".error);
				return;
			}
			ustudio_theme.delete_theme(theme);
			break;
		case "list":
			if(DEBUG){ console.log("CALL list_themes".debug); }
			ustudio_theme.list_themes();
			break;
		case "set":
			if(DEBUG){ console.log("CALL destination_set_theme".debug); }
			if(!theme){ console.error("ERROR a theme must be provided using the -t [theme name] option".error); return; }
			if(!destination){ console.error("ERROR a theme must be provided using the -d [destination uid] option".error); return; }
			ustudio_theme.destination_set_theme(destination, theme);
			break;
		case "upload":
			if(DEBUG){ console.log("CALL upload_theme: ".debug + theme); }
			_grunt(["clean:"+theme, "compress:"+theme, "ustudio-theme-upload:"+theme]);
			break;
		// Destinations
		case "destinations":
			if(DEBUG){ console.log("CALL list_destinations: ".debug); }
			ustudio_theme.list_destinations();
			break;
		case "modules":
			if(DEBUG){ console.log("CALL list_player_modules: ".debug + module); }
			ustudio_theme.list_player_modules(module);
			break;
		case "create-module":
			if(DEBUG){ console.log("CALL create_player_theme: ".debug + module); }
			if(!module){
				console.error("ERROR a module must be provided using the -m [module] option".error);
				return;
			}
			ustudio_theme.create_player_module(module);
			break;
		case "module":
			if(DEBUG){ console.log("CALL get_player_module: ".debug + module); }
			if(!module){
				console.error("ERROR a module must be provided using the -m [module] option".error);
				return;
			}
			ustudio_theme.get_player_module(module);
			break;
		case "delete-module":
			if(DEBUG){ console.log("CALL delete_player_module: ".debug + module); }
			if(!module){
				console.error("ERROR a module must be provided using the -m [module] option".error);
				return;
			}
			ustudio_theme.delete_player_module(module);
			break;
		case "upload-module":
			if(DEBUG){ console.log("CALL upload_player_module: ".debug + module); }
			if(!module){
				console.error("ERROR a module must be provided using the -m [module] option".error);
				return;
			}
			_grunt(["clean:"+module, "compress:"+module, "ustudio-module-upload:"+module]);
			break;
		case "enable-module":
			if(DEBUG){ console.log("CALL destination_enable_player_module: ".debug + module); }
			if(!module){ console.error("ERROR a module must be provided using the -m [module] option".error); return; }
			if(!destination){ console.error("ERROR a theme must be provided using the -d [destination uid] option".error); return; }
			ustudio_theme.destination_enable_player_module(destination, module);
			break;
		//Help
		case "watch":
			_grunt(["watch:"+theme]);
			break;
		case "help":
			opts.showHelp();
			break;
		default:
			console.error(("Method "+method+" not found").error);
	}
}

//## Grunt Task Runner
function _grunt(command, target, done){
	"use strict";
	var grunt = require("grunt");
	/*grunt.cli({
		tasks: [command],
		gruntfile: "./gruntfile.js",
		target: target
	});*/
	var options = {
		gruntfile: "./gruntfile.js",
		target: target
	};
	if(DEBUG){
		options.verbose = true;
		options.debug = true;
	}
	grunt.tasks(command, options, done);
}

//## Theme Functions
//### List Existing Themes
ustudio_theme.list_themes = function(){
	"use strict";
	var path = uStudioAPIEndpoints.themes();

	request('GET', path, null, null, function(theme_list_str){
		//### Handle the create theme API response
		var theme_list = JSON.parse(theme_list_str );
		console.log("Available Themes:".info);
		console.log( util.inspect(theme_list.themes, { colors: true }) );
	});
};

//### Upload a local theme
ustudio_theme.upload_theme = function(theme_name, done){
	"use strict";
	var theme_dir_path = "./themes/"+theme_name,
		theme_json_path = theme_dir_path + "/theme.json",
		theme_zip_path = theme_dir_path + "/"+theme_name+".zip",
		theme_json_exists = fs.existsSync(theme_json_path),
		theme_zip_exists = fs.existsSync(theme_zip_path);

	//Check that the required files exist
	if(!theme_json_exists){
		console.error("ERROR theme.json file not found: ".error + theme_json_path );
		return;
	}

	//_grunt(["clean:"+theme_name, "compress:"+theme_name], theme_name, function(){});

	if(!theme_zip_exists){
		console.error("ERROR theme zip file not found: ".error + theme_zip_path );
		return;
	}

	//Get the theme upload path
	var theme_json = JSON.parse(fs.readFileSync(theme_json_path));
	var path = theme_json.upload_url,
		host = path.split('/')[2];

	if(DEBUG){ console.log(("UPLOAD theme "+ theme_name+" ").debug + theme_zip_path); }
	console.log("Uploading please wait...".info);
	request('POST', path, null, {
		host: host,
		form: {
			fields:{
				package: fs.createReadStream(theme_zip_path)
			}
		}
	}, function(response, statusCode){
		if(DEBUG){
			//console.log(response);
			//console.log(statusCode);
		}
		if(statusCode >= 200 && statusCode < 300){
			console.log(("Theme "+theme_name+" (" + theme_json.uid + ") uploaded to uStudio ("+statusCode+")").info);
		}else{
			console.error(("ERROR "+statusCode+" unable to upload theme.").error);
		}
		if(done){ done(); }
	});
};

//### Create a new theme
ustudio_theme.create_theme = function(theme_name){
	"use strict";
	var theme_dir_path = "./themes/"+theme_name,
		theme_json_path = theme_dir_path + "/theme.json",
		theme_dir_exists = fs.existsSync(theme_dir_path);

	if(DEBUG){ console.log("  Checking for existing theme.json in ".debug + theme_dir_path); }
	if(theme_dir_exists){
		//get the files in this theme folder
		var files = fs.readdirSync(theme_dir_path);

		if(DEBUG){ console.log( "    files: ".debug + util.inspect(files, {colors:true})); }
		if(files.indexOf("theme.json") > -1){
			console.log(("Theme " + theme_name + " already exists.").info);
			var theme_json = JSON.parse(fs.readFileSync(theme_json_path));
			console.log(util.inspect(theme_json, {colors: true}));
			return;
		}
		if(DEBUG){ console.log("    No theme.json found".debug); }
	}

	var path = uStudioAPIEndpoints.themes();

	request('POST', path, null, {
		body:{
			name: theme_name
		}
	}, function(theme_config_str){
		//### Handle the create theme API response
		var theme_config = JSON.parse(theme_config_str);

		//Create the theme directory
		if(!theme_dir_exists){
			fs.mkdirSync(theme_dir_path);
		}

		if(!theme_config.uid){
			//If the theme is created there must be a theme_uid
			console.error("ERROR creating theme".error);
			console.dir(theme_config_str);
			return;
		}

		//create the theme.json
		var theme_file_json = JSON.stringify(theme_config, null, 4);
		fs.writeFile(theme_json_path, theme_file_json, function(err) {
			if(err) {
				throw err;
			} else {
				console.log(("Theme " + theme_name + " (uid: " + theme_config.uid + ") created successfully").info);
			}
		});

	});
};

//### Delete a theme
ustudio_theme.delete_theme = function(theme_name){
	"use strict";
	var theme_dir_path = "./themes/"+theme_name,
		theme_json_path = theme_dir_path + "/theme.json",
		theme_json_exists = fs.existsSync(theme_json_path);

	if(!theme_json_exists){
		console.error("ERROR theme.json not found".error + theme_json_path );
		return;
	}

	var theme_json = JSON.parse(fs.readFileSync(theme_json_path) ),
		path = uStudioAPIEndpoints.theme(theme_json.uid);

	request('DELETE', path, null, null, function(theme_delete_response){
		console.log(theme_delete_response);
		//If successful
			//delete the theme.json

	});
};

//## Destinations
//### List Destinations
ustudio_theme.list_destinations = function(callback){
	"use strict";
	ustudio_theme.get(uStudioAPIEndpoints.destinations());
};

ustudio_theme.get_destination = function(destination_uid, callback){
	"use strict";
	ustudio_theme.get(uStudioAPIEndpoints.destination(destination_uid));
};

//### Set Destination Player Theme
ustudio_theme.destination_set_theme = function(destination_uid, theme_name){
	"use strict";
	var theme_dir_path = "./themes/"+theme_name,
		theme_json_path = theme_dir_path + "/theme.json",
		theme_json_exists = fs.existsSync(theme_json_path);

	if(!theme_json_exists){
		console.error("ERROR theme.json not found".error + theme_json_path );
		return;
	}
	var theme_json = JSON.parse(fs.readFileSync(theme_json_path));

	request('PUT', uStudioAPIEndpoints.destination_player_modules(destination_uid), null, {
		body:{
			player_theme_uid:theme_json.uid
		}
	}, function(response_str){
		var response = JSON.parse(response_str);
		if(DEBUG){ console.log(" response: " + utils.inspect(response, {colors:true})); }
		if(response.error){
			console.error(("ERROR "+ response.message).error);
			return;
		}else{
			//If the theme has been set
			console.log("Theme "+theme_name + " ("+theme_json.uid+") set for destination "+destination_uid+":".info);
		}
	});
};

//## Generic CRUD
//### Settings
var _tpl = {
	directory_path: _.template("./{{type}}s/{{name}}"),
	json_path: _.template("./{{type}}s/{{name}}/{{type}}.json" ),
	msg_upload_status: _.template("SUCCESS {{type}} {{name}} (uid: {{uid}}) uploaded to uStudio ({{status}})")
};
function ustudio_theme_settings(type, name){
	"use strict";
	var ustudio_dir_path = _tpl.directory_path({ name: name, type: type }),
		ustudio_json = type+".json",
		ustudio_json_path = _tpl.json_path({ name: name, type: type }),
		ustudio_json_exists = fs.existsSync(ustudio_json_path),
		ustudio_dir_exists = fs.existsSync(ustudio_dir_path ),
		ustudio_zip_file = name+".zip",
		ustudio_zip_path = ustudio_dir_path + "/"+ustudio_zip_file,
		ustudio_zip_exists = fs.existsSync(ustudio_zip_path);

	return {
		dir: { path: ustudio_dir_path , EXISTS: ustudio_dir_exists } ,
		json: { file:ustudio_json, path: ustudio_json_path, EXISTS:  ustudio_json_exists},
		zip: { file: ustudio_zip_file, path: ustudio_zip_path , EXISTS: ustudio_zip_exists }
	};
}

//### Create
ustudio_theme.create = function(type, name, endpoint, callback){
	"use strict";
	var config = ustudio_theme_settings(type, name);
	if(DEBUG){ console.log("  Checking for existing "+config.json.file+" in ".debug + config.dir.path); }
	if(config.dir.EXISTS){
		//get the files in this module folder
		var files = fs.readdirSync(config.dir.path);
		if(DEBUG){ console.log( "    files: ".debug + util.inspect(files, {colors:true})); }
		if(files.indexOf(config.json.file) > -1){
			console.log((type+" " + name + " already exists.").info);
			var config_json = JSON.parse(fs.readFileSync(config.json.path));
			console.log(util.inspect(config_json, {colors: true}));
			return;
		}
		if(DEBUG){ console.log("    No "+config.json.file+" found".debug); }
	}

	request('POST', endpoint, null, {
		body:{
			name: name
		}
	}, function(ustudio_config_str){
		//### Handle the create module API response
		var config_json = JSON.parse(ustudio_config_str);

		//Create the module directory
		if(!config.dir.EXISTS){
			fs.mkdirSync(config.dir.path);
		}

		if(!config_json.uid){
			//If the module is created there must be a module_uid
			console.error(("ERROR creating "+type).error);
			console.dir(ustudio_config_str);
			return;
		}

		//create the config <type>.json
		var config_json_str = JSON.stringify(config_json, null, 4);
		fs.writeFile(config.json.path, config_json_str, function(err) {
			if(err){
				throw err;
			} else {
				console.log((type+" "+name+" (uid: " + config_json.uid + ") created successfully").info);
				if(callback){ callback(config_json, config); }
			}
		});

	});
};
//### Get / Read
ustudio_theme.get = function(endpoint){
	"use strict";
	//Note, not doing any checks on file existance.
	request('GET', endpoint, null, null, function(get_response){
		var get_json = JSON.parse(get_response);
		console.log( util.inspect(get_json, { colors: true, depth: 4 }));
	});
};
//### Update
ustudio_theme.update = function(type, name, endpoint, getData, callback){
	"use strict";
	var config = ustudio_theme_settings(type, name);
	if(!config.json.EXISTS){
		console.error("ERROR "+config.json.file+" not found ".error + config.json.path );
		return;
	}
	var config_json = JSON.parse(fs.readFileSync(config.json.path)),
		data = getData(config_json);
	request('POST', endpoint, null, {
		body:data
	}, function(response_str){
		var response = JSON.parse(response_str);
		if(DEBUG){ console.log(" response: " + response); }
		if(response.error){
			console.error(("ERROR "+ response.message).error);
			return;
		}else{
			//The update succeeded
			if(callback){ callback(response, config, data); }
		}
	});
};
//### Delete
ustudio_theme.delete = function(type, name, endpoint){
	"use strict";
	var config = ustudio_theme_settings(type, name);
	if(!config.json.EXISTS){
		console.error("ERROR "+config.json.file+" not found ".error + config.json.path );
		return;
	}
	request('DELETE', endpoint, null, null, function(delete_response){
		if(DEBUG){ console.log(" response: " + delete_response); }
		fs.unlinkSync(config.json.path);
		console.error(("SUCCESS deleted: "+config.json.file).info );
	});
};
//### Upload
ustudio_theme.upload = function(type, name, callback){
	"use strict";
	var config = ustudio_theme_settings(type, name);
	//Check that the required files exist
	if(!config.json.EXISTS){
		console.error(("ERROR "+config.json.file+" file not found: ").error + config.json.path );
		return;
	}
	if(!config.zip.EXISTS){
		console.error(("ERROR "+config.zip.file+" not found: ").error + config.zip.path );
		return;
	}
	//_grunt(["clean:"+theme_name, "compress:"+theme_name], theme_name, function(){});
	//Get the theme upload path
	var config_json = JSON.parse(fs.readFileSync(config.json.path)),
		endpoint;
	if(type === "theme"){
		endpoint = config_json.upload_url;
	}else if(type === "module"){
		endpoint = config_json.player_module_upload_url;
	}
	var host = endpoint.split('/')[2];

	if(DEBUG){ console.log((_.template("UPLOAD {{type}} {{name}} from: ", { type: type, name: name})).debug + config.zip.path); }
	console.log("Uploading please wait...".info);
	request('POST', endpoint, null, {
		host: host,
		form: {
			fields:{
				package: fs.createReadStream(config.zip.path)
			}
		}
	}, function(response, statusCode){
		if(DEBUG){
			console.log(("STATUS: "+statusCode).debug);
		}
		if(statusCode >= 200 && statusCode < 300){
			console.log( _tpl.msg_upload_status({ type: type, name: name, uid: config_json.uid, status: statusCode} ).info);
		}else{
			console.error(("ERROR "+statusCode+" unable to upload "+type).error);
		}
		if(callback){ callback(response, config); }
	});
};

//## Player Modules
//### Create Module

ustudio_theme.create_player_module = function(player_module_name){
	"use strict";
	ustudio_theme.create("module", player_module_name, uStudioAPIEndpoints.modules());
};

//### Get Module Info
ustudio_theme.get_player_module = function(player_module_name){
	"use strict";
	var config = ustudio_theme_settings("module", player_module_name);
	if(!config.json.EXISTS){
		console.error("ERROR "+config.json.file+" not found ".error + config.json.path );
		return;
	}
	var config_json = JSON.parse(fs.readFileSync(config.json.path) ),
		module_uid = config_json.uid;
	ustudio_theme.get(uStudioAPIEndpoints.module(module_uid));
};

//### List Modules
ustudio_theme.list_player_modules = function(){
	"use strict";
	ustudio_theme.get(uStudioAPIEndpoints.modules());
};

ustudio_theme.delete_player_module = function(player_module_name){
	"use strict";
	var config = ustudio_theme_settings("module", player_module_name);
	if(!config.json.EXISTS){
		console.error("ERROR "+config.json.file+" not found ".error + config.json.path );
		return;
	}
	var config_json = JSON.parse(fs.readFileSync(config.json.path) ),
		module_uid = config_json.uid;
	ustudio_theme.delete("module", player_module_name, uStudioAPIEndpoints.module(module_uid));
};

//### Enable Module on Destination
ustudio_theme.destination_enable_player_module = function(destination_uid, player_module_name, disable){
	"use strict";
	ustudio_theme.update("module", player_module_name, uStudioAPIEndpoints.destination_player_modules(destination_uid),
		function(config_json){
			return {
				player_module_uid: (disable) ? "" : config_json.uid
			};
		},
		function(request, config, data){
			console.log("Module "+player_module_name + " ("+data.uid+") enabled for destination "+destination_uid+":".info);
	});
};

ustudio_theme.upload_player_module = function(player_module_name, done){
	"use strict";
	ustudio_theme.upload("module", player_module_name, done);
};

//## HTTP Request Function
function request(method, path, params, options, callback){
	"use strict";

	if(config.access_token === ''){
		console.error("ERROR: Access Token Required.");
		return;
	}
	options = options || {};
	//add the access token
	var post_options = {
		host: options.host || "app.ustudio.com",
		path: path,
		method: method,//POST or GET
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': 0
		}
	};

	if(params && _.keys(params ).length > 0 ){
		post_options.path += "?" + querystring.stringify(params);
	}

	var post_body = null,
		form = null;

	if(options.form){
		form = new formData();
		_.each(options.form.fields, function(value, key){
			form.append(key, value);
		});
		post_options.headers =  form.getHeaders();
	}

	post_options.headers['X-Auth-Token'] = config.access_token;

	if(options.body){
		post_body = JSON.stringify(options.body, null, 2);
		post_options.headers['Content-Length'] = Buffer.byteLength(post_body);
	}
	if(DEBUG){
		console.log("POST request options:".debug);
		console.log(util.inspect(post_options, {colors:true}));
		if(options.body){
			console.log("POST request body:".debug);
			console.log(post_body.substring(0, 200));
		}
	}
	if(!TEST){
		if(options.form){
			form.submit(post_options,  _.partial(response_callback, callback));
		}else{
			var req = https.request(post_options, _.partial(response_callback, callback, null));
			if(options.body && post_body){
				req.write(post_body);
			}
			req.end();
		}
	}
}

function response_callback(callback, error, response) {
	"use strict";
	var str = '';
	if(error){ throw error; }
	response.setEncoding('utf-8');

	response.on('data', function (chunk) {
		str += chunk;
	});

	response.on('end', function () {
		callback(str, response.statusCode);
	});
}

if(process.argv && process.argv.length > 2){// If invoked from the commandline
	if(process.argv[1].indexOf("ustudio-theme") > -1 ){
		ustudio_theme();
	}
}

module.exports = ustudio_theme;
