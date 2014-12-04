(function() {

  // this global function must be called by each module
  uStudio.uStudioCore.instance.registerModule({

    // the name must be the same name registered to the API
    name: "example_module",

    // initialize function is called with the following arguments:
    // @configuration is an object with the module-specific config
    // @events is the event bus for broadcast and subscribe
    // @videos is the list of videos for the player and the metadata
    initialize: function(configuration, events, videos) {

      console.log('Number of videos: ' + videos.length);
      console.log('Configuration: ' + window.JSON.stringify(configuration));

      // the event bus is used to subscribe to specific events from
      // other modules, as well as broadcast custom events.
      events.subscribe('Player.timeupdate', function(timeEvent) {

        var time = timeEvent.currentTime;
        console.log("Current time is: " + time);

        if (time > 5 && time < 6) {
          // broadcasting an event takes a string @name and an array
          // of arguments, and goes to all modules as well as postmessage
          events.broadcast('example.cue', [5.0]);
        }

      });
    }
  });

})();