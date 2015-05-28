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

	uStudio.uStudioCore.instance.registerModule({
		name: "iga_ustudio_analytics",
		initialize: function(configuration, events, videos) {
			var settings = {
				name: "",
				duration:0,
				progress: 0,
				bucket: null
			};
			//Track outbound links
			$(function(){
				setTimeout(function(){
					$("a:external").on("click", function(e){
						trackOutboundLink(e.target.href);
					});
				},0);
			});
			//## Events
			//### Play
			events.subscribe("Player.playing", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "play", settings.name); }
			});
			//### Paused
			events.subscribe("Player.paused", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "pause", settings.name); }
			});
			//### Ended
			events.subscribe("Player.ended", function() {
				if(_gaOK()){ ga("send", "event", "uStudio Player", "end", settings.name); }
			});
			//### Time Update
			events.subscribe("Player.timeupdate", function(timeEvent) {
				var update = settings.bucket.update(timeEvent.currentTime);
				if(update.changed !== 0){
					// track in buckets of 5%
					if(_gaOK()){ ga("send", "event", "uStudio Player", "progress : "+update.bin.percentage+"%", settings.name, 1, true); }
				}
			});
			//### Video Selected
			events.subscribe("Playlist.videoSelected", function(video) {
				settings.name = video.video.name;
				settings.duration = video.video.duration;
				settings.bucket = new Bucket(20, video.video.duration);// 5% buckets
				settings.progress = 0;
				if(_gaOK()){ ga("send", "event", "uStudio Player", "video", settings.name); }
			});
		}
	});

	function Bucket(count, max){
		this.size = (max / count) | 0;// IDIV
		var bins = this.bins = [];
		this._bin = 0;
		for(var i = 0; i <= count; i++){// from 0-count (0-100%)
			bins.push({
				index: i,
				percentage: ((i / count) * 100) | 0,
				start: this.size * i, // >=
				end: this.size * (i+1)// <
			});
		}
	}
	//inherits(Bucket, EventEmitter);

	Bucket.prototype.bin = function(val){
		var bin = (val / this.size) | 0; //IDIV
		if(bin >= this.bins.length){
			bin = this.bins.length-1;
		}else if (bin < 0){
			bin = 0;
		}
		return this.bins[bin];
	};

	Bucket.prototype.update = function(val){
		var compare = this.compare(val ),
			oldBin = this.bins[this._bin];
		this._bin = this.bin(val).index;
		var newBin = this.bins[this._bin],
			data = { changed: compare, bin: newBin, from: oldBin };
		//this.trigger("update", [data]);
		return data;
	};

	Bucket.prototype.compare = function(val){
		var bin = this.bin(val);
		if(this._bin === bin.index){
			return 0;
		}else if(bin.index > this._bin){
			return 1;
		}else{
			return -1;
		}
	};
})(jQuery);
