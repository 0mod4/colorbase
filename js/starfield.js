(function ( $ ) {
 
	var starfield_interval_id;

    $.fn.createStarfield = function(number_of_stars) {
		// create initial random starfield
		function createStars(number_of_stars) {
		    var star_position = new Array();

		    for (var i = 0; i < number_of_stars; i++) {
		        var star_size = Math.round(Math.random() * 2 + 1)
		        star_position['x'] = Math.random() * 100;
		        star_position['y'] = Math.random() * 100;

		        $('body').append("<div class='star id" + i + "'></div>");
		        // set initial start position and size
		        $('body .star.id' + i).css(
		            {
		                'left': star_position['x'] + '%',
		                'top': star_position['y'] + '%',
		                'height': star_size,
		                'width': star_size,
		                'background-color': 'rgba(255,255,255,'+Math.random()+')',
		                'transition': 'left '+(Math.random()*(11-8)+8)+'s ease-in, top '+(Math.random()*(11-8)+8)+'s ease-in, background-color 3s'
		            }
		        );
		        animateStars(i);
		    }
		}

		// animate stars
		function animateStars(i) {
		    var temp_pos = new Array();
		    var absolute = new Array();
		    var multiplier = null;
		    var star_position_in_px = $('body .star.id' + i).offset();

		    // calculate final position
		    temp_pos['x'] = star_position_in_px.left - viewport['center_x'];
		    temp_pos['y'] = star_position_in_px.top - viewport['center_y'];
		    absolute['x'] = Math.abs(temp_pos['x']);
		    absolute['y'] = Math.abs(temp_pos['y']);
		    if ( absolute['x'] > absolute['y']) {
		        multiplier = (viewport['center_x'] + 10) / absolute['x'];
		    } else {
		        multiplier = (viewport['center_y'] + 10) / absolute['y'];
		    }

		    // set end position
		    $('body .star.id' + i).css(
		        {
		            'left': (multiplier * temp_pos['x'] + viewport['center_x']) + 'px',
		            'top': (multiplier * temp_pos['y'] + viewport['center_y']) + 'px'
		        }
		    );
		}

		// looks for stars that have left the viewport and resets their position to random center
		function updateStars() {
		    var all_stars = $('.star');
		    for (var i = 0; i < all_stars.length; i++) {
		        star = all_stars[i];
		        if (star.offsetLeft > viewport['width'] || star.offsetTop > viewport['height'] ||
		            star.offsetLeft < 0 || star.offsetTop < 0
		        ) {
		            var new_position = new Array();
		            new_position['left'] = viewport['center_x'] + (Math.random() *100 - 50);
		            new_position['top'] = viewport['center_y'] + (Math.random() *100 - 50);
		            var current_transition_css = $(star).css('transition')
		            $(star).css({
		                'transition': 'none',
		                'background-color': 'rgba(255,255,255,0)'
		            })
		            $(star).offset(new_position);
		            $('body .star.id' + i).offset();
		            $(star).css({
		                'transition': current_transition_css,
		                'background-color': 'rgba(255,255,255,'+Math.random()+')'
		            })
		            animateStars(i);
		        }
		    }
		}

	    // starfield background
	    createStars(number_of_stars);
	    starfield_interval_id = window.setInterval(
	    	function() {
            	updateStars(), 1000
	    	}
    	)
        
    };

    $.fn.removeStarfield = function() {
    	clearInterval(starfield_interval_id);
    	$('.star').remove();
    };
 
}( jQuery ));