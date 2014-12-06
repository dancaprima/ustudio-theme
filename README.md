ustudio-theme
====================

##Installation

1. Install [Node.js](http://nodejs.org/)

2. Install via NPM
	cd path/to/ustudio-theme
    npm install -g

##Usage

Set your ustudio keys in config.json and create a theme in the themes/directory following the example of the sample theme.

###List Themes
    ustudio-theme list

###Create a new theme
    ustudio-theme create -t [theme name]

###Delete an existing theme
    ustudio-theme -t [theme name]

###Upload a theme
    ustudio-theme -t [theme name]

###Help
    ustudio-theme help

All commands also support the `--debug` and `--test` options for debug output and not making API requests respectively.

##Documentation
Official uStudio docs can be found in the docs/ folder.
