/**
 * @file iga.ustudio.analytics.js
 */

/**
 * jQuery External Link Expression Plugin
 * @param $
 */
(function($){
	"use strict";
	$.expr[':'].external = function (a) {
		var PATTERN_FOR_EXTERNAL_URLS = /^(\w+:)?\/\//;
		var href = $(a).attr('href');
		return href !== undefined && href.search(PATTERN_FOR_EXTERNAL_URLS) !== -1;
	};
	$.expr[':'].internal = function (a) {
		return $(a).attr('href') !== undefined && !$.expr[':'].external(a);
	};
})(jQuery);

(function($){
	"use strict";
	function _gaOK(){return (typeof ga !== "undefined"); }
	/**
	 * @see https://support.google.com/analytics/answer/1136920?hl=en
	 */
	function trackOutboundLink(url) {
		if(_gaOK()){
			ga('send', 'event', 'outbound links', 'click', url);
		}
	}
	//Track outbound links
	$("a:external").on("click", function(e){
		trackOutboundLink(e.target.href);
	});
	uStudio.uStudioCore.instance.registerModule({
		name: "iga_ustudio_analytics",
		initialize: function(configuration, events, videos) {
			var firstVideo = videos[0];
			configuration.videoName = "";
			configuration.videoProgress = 0;
			console.log("iga_ustudio_analytics:initialize");
			//## Events
			//### Play
			events.subscribe("Player.playing", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "play", configuration.videoName); }
			});
			//### Paused
			events.subscribe("Player.paused", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "pause", configuration.videoName); }
			});
			//### Ended
			events.subscribe("Player.ended", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "end", configuration.videoName); }
			});
			//### Time Update
			events.subscribe("Player.timeupdate", function(timeEvent) {
				var timeDiff = timeEvent.currentTime - configuration.videoProgress;
				if(timeDiff > 10){
					// track in 10 second intervals
					if(_gaOK()){ ga("send", "event", "uStudio Player", "time", configuration.videoName, timeDiff, true); }
					configuration.videoProgress += timeDiff;
				}
			});
			//### Video Selected
			events.subscribe("Playlist.videoSelected", function(video) {
				configuration.videoName = "";
				configuration.videoProgress = 0;
				if(_gaOK()){ ga("send", "event", "uStudio Player", "video", configuration.videoName); }
			});
		}
	});
})(jQuery);