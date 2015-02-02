/*jsl:declare HTMLMediaElement*/
/*jsl:declare MediaError*/
/*jsl:declare YT*/
/*jsl:declare $*/
/*jsl:declare uStudio*/
/*jsl:declare document*/
/*jsl:declare console*/
/*jsl:declare window*/
/*jsl:declare navigator*/

(function() {

  var _wrap = function(target, method) {
    if (!method) {
      return function() {
        console.log('MISSING METHOD.');
      };
    }
    return function() {
      return method.apply(target, arguments);
    };
  };


  var _YTSTATES = {
    '-1': 'unstarted',
    '0': 'ended',
    '1': 'playing',
    '2': 'paused',
    '3': 'buffering',
    '5': 'cued'
  };

  var YTPlayer = function(events, config, videos) {
    this._events = events;
    this._config = config;
    this._videos = videos;
    this._currentVideo = videos[0];
    this._player = null;

    this._events.subscribe('Player.build', _wrap(this, this._onBuild));
    this._events.subscribe('Playlist.videoSelected', _wrap(this._onVideoSelected));
    this._events.subscribe('Player.play', _wrap(this, this._onPlay));
    this._events.subscribe('Player.pause', _wrap(this, this._onPause));
    this._events.subscribe('Player.seek', _wrap(this, this._onSeek));
    this._events.subscribe('Player.seekto', _wrap(this, this._onSeekTo));
    this._events.subscribe('Player.mute', _wrap(this, this._onMute));
    this._events.subscribe('Player.load', _wrap(this, this._onLoad));
    this._events.subscribe('Player.changeSource', _wrap(this, this._onChangeSource));
    this._events.subscribe('Player.changeVolume', _wrap(this, this._onChangeVolume));
  };

  YTPlayer.prototype._onVideoSelected = function(selectEvent) {
    console.log('Supposed to be selecting video: ', arguments);
    this._currentVideo = selectEvent.video;
    this._player.cueVideoById(this._currentVideo.youtube_id);
    this._events.broadcast('Player.durationchange', [{duration: this._currentVideo.duration}]);
  };

  YTPlayer.prototype._onLoad = function(message) {
    var youtubeId = message.url.youtube;
    console.log('Supposed to be loading: ' + youtubeId);
    this._events.broadcast('Player.loaded');
  };

  YTPlayer.prototype._onChangeSource = function() {
    console.log('Supposed to be changing source: ' + arguments);
  };

  YTPlayer.prototype._onBuild = function(playerId) {
    var self = this;

    var iOS = false, iDevice = ['iPhone', 'iPod'];

    for (var i = 0; i < iDevice.length ; i++ ) {
        if( navigator.platform === iDevice[i] ){ iOS = true; break; }
    }

    var playerDiv;

    if (iOS) {
      console.log('IOS');
      var body = document.getElementsByTagName('body')[0];
      while (body.childNodes.length > 0) {
        body.removeChild(body.childNodes[0]);
      }
      playerDiv = document.createElement('div');
      playerDiv.style.width = '100%';
      playerDiv.style.height = '100%';
      playerDiv.style.position = 'absolute';
      playerDiv.style.left = '0';
      playerDiv.style.top = '0';
      playerDiv.id = 'youtube-player-replace';
      body.appendChild(playerDiv);
    } else {
      // these HTML elements probably shouldn't be here...
      playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player-replace';
      var playerContainer = document.getElementById(playerId);
      playerContainer.appendChild(playerDiv);

      // this is a shortcut to catch mouse movement, but not prevent clicking on
      // YouTube's layer (ads, annotations, etc.). Shouldn't be here either.
      var coverDiv = document.createElement('div');
      coverDiv.style.width = '100%';
      coverDiv.style.height = '100%';
      coverDiv.style.position = 'absolute';
      coverDiv.style.top = '0px';
      coverDiv.style.left = '0px';
      coverDiv.setAttribute('data-player-interaction', 'true');
      coverDiv.setAttribute('data-player-states', 'idle,waiting,loading');
      playerContainer.appendChild(coverDiv);
    }

    var playerVars = {
      controls: 0,
      autoplay: 0,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    };

    if ($('html').hasClass('touch')) {
      console.log('Touch friendly.');
      playerVars.controls = 1;
    }

    this._player = new YT.Player(playerDiv.id, {
      height: '100%',
      width: '100%',
      playerVars: playerVars,
      events: {
        onReady: function() {
          console.log('YouTube player ready.');
          self._onVideoSelected({video: self._currentVideo});
          self._events.broadcast('Player.fullready');
        },
        onStateChange: function(message) {
          var state = _YTSTATES['' + message.data];
          self._onYouTubeStateChange(state);
        },
        onError: function() {
          console.log("YOUTUBE ERROR");
          console.log.apply(console, arguments);
        }
      }
    });
  };

  YTPlayer.prototype._onYouTubeStateChange = function(state) {
    var self = this;

    console.log('State: ' + state);
    var commands = {
      unstarted: function() {
        self._events.broadcast('Player.loaded');
      },
      cued: function() {
        self._events.broadcast('Player.loaded');
      },
      playing: function() {
        self._events.broadcast('Player.playing');
        var duration = self._player.getDuration();
        self._events.broadcast('Player.durationchange', [{duration: duration}]);
        console.log('Playing: ' + duration);
      },
      paused: function() {
        self._events.broadcast('Player.paused');
      },
      buffering: function() {
        self._events.broadcast('Player.waiting');
      },
      ended: function() {
        self._events.broadcast('Player.ended');
      }
    };
    commands[state]();
  };

  YTPlayer.prototype._onPlay = function() {
    console.log('Supposed to be playing: ' + arguments);
    this._player.playVideo();
  };

  YTPlayer.prototype._onPause = function() {
    console.log('Supposed to be pausing: ' + arguments);
    this._player.pauseVideo();
  };

  YTPlayer.prototype._onSeek = function() {
    console.log('Supposed to be seeking: ' + arguments);
  };

  YTPlayer.prototype._onSeekTo = function(seekEvent) {
    console.log('Supposed to be seeking to: ', seekEvent.value);
    this._player.seekTo(seekEvent.value, true);
  };

  YTPlayer.prototype._onChangeVolume = function() {
    console.log('Supposed to be changing volume: ' + arguments);
  };

  YTPlayer.prototype._onMute = function() {
    console.log('Supposed to be muting: ' + arguments);
  };

  YTPlayer.prototype._onTick = function() {
    var now = new Date().getTime();
    if (this._lastTickUpdate > now - 5000) {
      // preventing from hammering the event stream if
      // callbacks are taking too long.
      return;
    }
    this._lastTickUpdate = now;
    var currentTime = this._player.getCurrentTime();
    var currentDuration = this._player.getDuration();
    var currentBuffered = this._player.getVideoLoadedFraction();

    if (this._currentTime != currentTime) {
      this._currentTime = currentTime;
      this._events.broadcast('Player.timeupdate', [{currentTime: currentTime}]);
    }

    if (this._currentDuration != currentDuration && currentDuration > 0) {
      this._currentDuration = currentDuration;
      this._events.broadcast('Player.durationchange', [{duration: currentDuration}]);
    }

    if (this._currentBuffered != currentBuffered) {
      this._currentBuffered = currentBuffered;
      this._events.broadcast('Player.buffered', [{percentage: currentBuffered * 100}]);
    }

    // refresh so the next knows it isn't blocked
    this._lastTickUpdate = 0;
  };

  YTPlayer.prototype.load = function(callback) {
    var self = this;

    window.onYouTubeIframeAPIReady = function() {
      console.log("YouTube iframe API ready.");
      self._timer = window.setInterval(function() {
        self._onTick();
      }, 750);
      var remaining = self._videos.length;
      self._videos.forEach(function(video) {
        console.log(video.youtube_id);
        remaining -= 1;
        // hardcoding because why not
        video.transcodes = {
          youtube: [
            {name: '720p', width: 1280, height: 720, url: video.youtube_id},
            {name: '1080p', width: 1920, height: 1080, urls: video.youtube_id}
          ]
        };
        if (remaining === 0) {
          callback();
        }
      });
    };

    var script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.getElementsByTagName("body")[0].appendChild(script);
  };

  YTPlayer.prototype.filter = function(callback) {
    // shouldn't need to filter at this point.
    // maybe one day filter out the flash only videos on mobile?
    callback(this._videos);
  };

  var youtubePlayer;

  uStudio.uStudioCore.instance.registerModule({
    name: 'YouTubePlayer',
    initialize: function(configuration, events, videos, callback) {
      youtubePlayer = new YTPlayer(events, configuration, videos, callback);
      youtubePlayer.load(function() {
        console.log("YouTube player module loaded.");
        callback();
      });
    }
  });

})(this);
