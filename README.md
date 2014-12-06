ustudio-theme
====================

##Installation

1. Install [Node.js](http://nodejs.org/)

2. Install via [npm](https://www.npmjs.org/)

```sh
cd path/to/ustudio-theme
npm install -g
```

##Usage

Set your ustudio keys in config.json and create a theme in the themes/directory following the example of the sample theme.

###List Themes
```sh
ustudio-theme list
```

###Create a new theme
```sh
ustudio-theme create -t [theme name]
```

###Delete an existing theme
```sh
ustudio-theme delete -t [theme name]
```

###Upload a theme
```sh
ustudio-theme upload -t [theme name]
```

###Set a theme to a destination
```sh
ustudio-theme upload -t [theme name] -d [destination uid]
```

###List destinations
```sh
ustudio-theme destinations
```

###Help
```sh
ustudio-theme help
```

All commands also support the `--debug` and `--test` options for debug output and not making API requests respectively.

##Documentation
Official uStudio docs can be found in the docs/ folder.
