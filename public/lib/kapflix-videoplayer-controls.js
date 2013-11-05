(function($) {
	$.fn.videoPlayer = function(options) {		

		var defaults = {
			theme: 'simpledark',
			childtheme: ''
		};

		var options = $.extend(defaults, options);

		return this.each(function() {
			var $videoPlayer = $(this);
			var $videoPlayerWrapper = $('<div></div>').addClass('kapflix-video-player').addClass(options.theme).addClass(options.childtheme);
			var $videoControls = $('<div class="kapflix-video-controls"><a class="kapflix-video-play" title="Play/Pause"></a><div class="kapflix-video-seek"></div><div class="kapflix-video-timer">00:00 / 00:00</div><div class="kapflix-volume-box"><div class="kapflix-volume-slider-back"></div><div class="kapflix-volume-slider"></div><a class="kapflix-volume-button" title="Mute/Unmute"></a></div></div>');						
			
			$videoPlayer.wrap($videoPlayerWrapper);
			$videoPlayer.after($videoControls);
			
			var $videoPlayerContainer = $videoPlayer.parent('.kapflix-video-player');
			var $videoPlayerControls = $('.kapflix-video-controls', $videoPlayerContainer);
			var $playButton = $('.kapflix-video-play', $videoPlayerContainer);
			var $seek = $('.kapflix-video-seek', $videoPlayerContainer);
			var $timer = $('.kapflix-video-timer', $videoPlayerContainer);
			var $volume = $('.kapflix-volume-slider', $videoPlayerContainer);
			var $volumeButton = $('.kapflix-volume-button', $videoPlayerContainer);
			
			$videoPlayerControls.hide();
						
			var play = function() {
				if (typeof($videoPlayer) == 'undefined')
					return;

				if($videoPlayer[0]['paused'] == false) {
					$videoPlayer[0].pause();					
				} else {					
					$videoPlayer[0].play();				
				}
			};
			
			$playButton.click(play);
			$videoPlayer.click(play);
			
			$videoPlayer.bind('play', function() {
				$playButton.addClass('kapflix-paused-button');
			});
			
			$videoPlayer.bind('pause', function() {
				$playButton.removeClass('kapflix-paused-button');
			});
			
			$videoPlayer.bind('ended', function() {
				$playButton.removeClass('kapflix-paused-button');
			});
			
			var seeksliding;			
			var createSeek = function() {
				if($videoPlayer[0].readyState > 0) {
					var duration = $videoPlayer[0].duration;
					$seek.slider({
						value: 0,
						step: 0.01,
						orientation: "horizontal",
						range: "min",
						max: duration,
						animate: true,					
						slide: function(){							
							seeksliding = true;
						},
						stop:function(e,ui){
							seeksliding = false;						
							$videoPlayer[0]["currentTime"] = ui.value;
						}
					});
					$timer.text('00:00 / ' + formatTime(duration));
					$videoControls.show();					
				} else {
					setTimeout(createSeek, 150);
				}
			};

			createSeek();
		
			var formatTime = function(seconds){
				var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
				var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
				return m+":"+s;
			};
			
			var seekUpdate = function() {
				var currenttime = $videoPlayer[0].currentTime;
				var duration = $videoPlayer[0].duration;
				if(!seeksliding){
					try{
						$seek.slider('value', currenttime);	
					}
					catch(e){

					}
				}
				$timer.text(formatTime(currenttime) + " / " + formatTime(duration));							
			};
			
			$videoPlayer.bind('timeupdate', seekUpdate);	
			
			var volume = 1;
			$volume.slider({
				value: 1,
				orientation: "vertical",
				range: "min",
				max: 1,
				step: 0.05,
				animate: true,
				slide:function(e,ui){
					$videoPlayer[0]['muted'] = false;
					volume = ui.value;
					$videoPlayer[0]['volume'] = ui.value;

					$videoPlayer[0]['muted'] = (ui.value <= 0);
					if (ui.value <= 0)
						$volumeButton.addClass('kapflix-volume-mute');
					else
						$volumeButton.removeClass('kapflix-volume-mute');
				}
			});
			
			var muteVolume = function() {
				if($videoPlayer[0]['muted']==true) {
					volume = volume <= 0 ? 0.5 : volume;
					$videoPlayer[0]['muted'] = false;
					$videoPlayer[0]['volume'] = volume;
					$volume.slider('value', volume);
					
					$volumeButton.removeClass('kapflix-volume-mute');					
				} 
				else{
					$videoPlayer[0]['muted'] = true;
					$volume.slider('value', '0');
					
					$volumeButton.addClass('kapflix-volume-mute');
				};
			};
			
			$volumeButton.click(muteVolume);
			
			$videoPlayer.removeAttr('controls');
			
		});
	};

	$.fn.videoPlayer.defaults = {		
	};

})(jQuery);