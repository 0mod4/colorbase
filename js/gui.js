(function ( $ ) {
 
    $.fn.initGUI = function() {
    	// init dom
    	var input_form = new Array();
		var option_form = new Array();
		input_form.container = $('div.inputform');
		input_form.self = $('form[name="form"]');
		input_form.query_input = $('#queryText');
		input_form.marker = input_form.self.find('.marker');
		option_form.container = $('div.optionform');
		option_form.container_width = $('div.optionform').width();
		option_form.self = option_form.container.find('form[name="options"]');
    	option_form.toggle = option_form.container.find('.toggle');
    	// initially hide option form
    	option_form.self.slideToggle();

    	function centerOptionForm() {
			var new_position = viewport.center_x - (option_form.container_width) / 2;
			option_form.container.css({
				'margin-left': new_position+'px'
			})
    	}

    	function enableToggleOptionForm() {
    		option_form.toggle.click(function() {
    			option_form.self.slideToggle();
    		})
    	}

    	function blinkingCursor() {
			caret_position = input_form.query_input.caret('offset');
			cursor_position = caret_position.left - input_form.marker.width();
			input_form.marker.css({
				'left': cursor_position+'px'
			})
    	}

    	// center the lower option form dynamically because CSS won't work with absolute positioning
    	centerOptionForm();
    	// enable toggling of the option form element
    	enableToggleOptionForm();
    	// simulate blinking cursor at end of input
	    input_form.query_input.on('input click', function() {
	    	blinkingCursor()
	    });
    };

}( jQuery ));
console.log('gui module initialized');