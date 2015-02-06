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
			var settings = {
				videoName: "",
				progress: 0
			};
			console.log("iga_ustudio_analytics:initialize");
			//## Events
			//### Play
			events.subscribe("Player.playing", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "play", settings.videoName); }
			});
			//### Paused
			events.subscribe("Player.paused", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "pause", settings.videoName); }
			});
			//### Ended
			events.subscribe("Player.ended", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "end", settings.videoName); }
			});
			//### Time Update
			events.subscribe("Player.timeupdate", function(timeEvent) {
				var timeDiff = timeEvent.currentTime - settings.progress;
				if(timeDiff > 10){
					// track in 10 second intervals
					if(_gaOK()){ ga("send", "event", "uStudio Player", "time", settings.videoName, timeDiff, true); }
					settings.progress += timeDiff;
				}
			});
			//### Video Selected
			events.subscribe("Playlist.videoSelected", function(video) {
				settings.videoName = video.video.name;
				settings.progress = 0;
				if(_gaOK()){ ga("send", "event", "uStudio Player", "video", settings.videoName); }
			});
		}
	});
})(jQuery);
