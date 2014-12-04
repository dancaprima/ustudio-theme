(function() {

  // this is the call that all modules must make to register
  // that the module has loaded properly.
  uStudio.uStudioCore.instance.registerModule({

    // the name here must match the name of the module provided
    // to the API
    name: "cuemodule",

    // `configuration` is a dictionary of default and overridden
    // config values from the API
    // `events` is the event bus, which is used for subscribing
    // and publishing messages
    // `videos` is a list of video metadata -- playlist players
    // are the only times you will have more than one video
    initialize: function(configuration, events, videos) {

      // the body of this callback is entirely up to the module.
      // in this case, we are constructing an instance of a
      // class, but simple modules might just add subscribers
      // inside the body of an anonymous function.
      console.log("Initializing cue module.");
      window.Cues = new CueModule(configuration, events, videos);
      window.Cues.initialize();

    }
  });

  // the CueModule class is just an example of time-based dynamic
  // behavior, driven by module events and an external (JSONP)
  // API. There should be example instructions for testing this.
  //
  // For module authors, the most important points are that:
  //
  // a.) All event subscription takes place in the initialize
  //     callback of the registerModule object.
  // b.) All event broadcast happens either after the
  //     `start` event is broadcasted, or in response to
  //     another event that has been broadcasted. This
  //     ensures that all modules have a chance to subscribe
  //     to the appropriate events.
  //
  // Pay particular attention to the areas where events are
  // subscribed and broadcast below to see how the event bus
  // is utilized.

  var CueModule = function(config, events, videos) {
    this._config = config;
    this._events = events;
    this._videos = videos;
    this._track = null;
    this._stylesheet = config.stylesheet || "http://localhost:8000/cues.css";
    this._cueServer = config.cueserver || "http://localhost:8000";
    this._suffix = config.suffix || ".js";
    if (this._cueServer[this._cueServer.length - 1] != "/") {
      this._cueServer += "/";
    }
  };

  CueModule.prototype.initialize = function() {
    this._events.subscribe('Playlist.videoSelected', this.onVideoSelected, this);
    this._events.subscribe('Player.timeupdate', this.onTimeUpdate, this);

    if (this._stylesheet) {
      var stylesheet = document.createElement("link");
      stylesheet.href = this._stylesheet;
      stylesheet.rel = "stylesheet";
      stylesheet.type = "text/css";
      $("body").append(stylesheet);
    }

  };

  CueModule.prototype.hideAllCues = function() {
    $("[data-player-overlay=cue]").remove();
  };

  CueModule.prototype.onVideoSelected = function(event) {
    this.hideAllCues();
    this.requestTrack(event.video.id);
  };

  CueModule.prototype.onTimeUpdate = function(event) {
    if (!this._track) {
      return;
    }
    this._track.updateCues(event.currentTime, function(active, deactive) {
      var i;
      for (i = 0; i < active.length; i++) {
        active[i].activate();
      }
      for (i = 0; i < deactive.length; i++) {
        deactive[i].deactivate();
      }
    });
  };

  CueModule.prototype.requestTrack = function(videoId) {
    this._track = null;
    var url = this._cueServer + videoId + this._suffix + "?callback=window.Cues.loadTrack";
    var script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    $("body").append(script);
  };

  CueModule.prototype.loadTrack = function(track) {
    this._track = new Track(track, this._events);
  };

  var Track = function(track, events) {
    this._track = track;
    this._cues = track.cues;
    var i;
    for (i = 0; i < this._cues.length; i++) {
      extendCue(this._cues[i], events);
    }
  };

  Track.prototype.updateCues = function(time, callback) {
    var cue, i, activated = [], deactivated = [];
    for (i = 0; i < this._cues.length; i++) {
      cue = this._cues[i];
      if (cue.active) {
        if (cue.start_time > time || cue.end_time < time) {
          cue.active = false;
          deactivated.push(cue);
        }
      } else {
        if (cue.start_time <= time && cue.end_time >= time) {
          cue.active = true;
          activated.push(cue);
        }
      }
    }
    callback(activated, deactivated);
  };

  var CLICK_TYPES = {
    pause: function(cue) {
      cue.events.broadcast("Player.pause");
    },
    remove: function(cue) {
      $("[data-cue-id=" + cue.id + "]").remove();
    },
    play: function(cue) {
      cue.events.broadcast("Player.play");
    },
    event: function(cue) {
      var eventName = cue.data.event;
      var eventArguments = cue.data.arguments;
      cue.events.broadcast(eventName, eventArguments);
    }
  };

  var CUE_TYPES = {
    defaultType: {
      activate: function(cue) {
        console.log("Cue activated: " + cue.id);
      },
      deactivate: function(cue) {
        console.log("Cue deactivated: " + cue.id);
      }
    },
    event: {
      activate: function(cue) {
        console.log("Event " + cue.id + " dctivated: (" + cue.data.event + ")");
        var eventName = cue.data.event;
        var eventArguments = cue.data.arguments;
        cue.events.broadcast(eventName, eventArguments);
      },
      deactivate: function(cue) {
        // really just a no-op
        console.log("Event " + cue.id + " deactivated: (" + cue.data.event + ")");
      }
    },
    html: {
      activate: function(cue) {
        console.log("Activated HTML cue: " + cue.id);
        var element = $(cue.data.html);
        var playerContainer = $("[data-player-container=player]");
        var tempContainer = $("<div/>");
        element.attr("data-cue-id", cue.id);
        element.attr("data-player-overlay", "cue");
        tempContainer.append(element);
        tempContainer.find("[data-player-cue-onclick]").each(function() {
          var clickElement = $(this);
          var clickEvents = clickElement.attr("data-player-cue-onclick").split(",");
          for (var i = 0; i < clickEvents.length; i++) {
            var clickEvent = clickEvents[i];
            console.log("Registering click event " + clickEvent + " for cue " + cue.id);
            var clickTrigger = CLICK_TYPES[clickEvent];
            if (!clickTrigger) {
              console.log("Unknown click event type: " + clickEvent);
              continue;
            }
            clickElement.click((function(trigger, e, c) {
              return function() {
                console.log("Click event " + e + " triggered.");
                trigger(c);
              };
            })(clickTrigger, clickEvent, cue));
          }
        });
        delete tempContainer;
        playerContainer.append(element);
      },
      deactivate: function(cue) {
        console.log("Deactivating HTML cue: " + cue.id);
        $("[data-cue-id='" + cue.id + "']").remove();
      }
    }
  };

  var extendCue = function(cue, events) {
    console.log("Loading cue: " + cue.id + " (" + cue.start_time + " - " + cue.end_time + ")");
    var actions = CUE_TYPES[cue.data.type] || CUE_TYPES.defaultType;
    cue.activate = function() { actions.activate(cue); };
    cue.deactivate = function() { actions.deactivate(cue); };
    cue.events = events;
    cue.active = false;
  };

})();
