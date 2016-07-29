(function ( $ ) {
 
    $.fn.initGUI = function() {
    	// init dom
    	var input_form = new Array();
		var option_form = new Array();
		input_form.container = $('div.inputform');
		input_form.self = $('form[name="form"]');
		input_form.query_input = $('#queryText');
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

    	// center the lower option form dynamically because CSS won't work with absolute positioning
    	centerOptionForm();
    	// enable toggling of the option form element
    	enableToggleOptionForm();
    };

}( jQuery ));
console.log('gui module initialized');