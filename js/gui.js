(function ($) {

  $.fn.initGUI = function () {
    // init dom
    var input_form = []
    var option_form = []
    input_form.container = $('div.inputform')
    input_form.self = input_form.container.find('form[name="form"]')
    input_form.query_input = $('#queryText')
    input_form.marker = input_form.self.find('.marker')
    option_form.container = $('div.optionform')
    option_form.container_height = $('div.optionform').height()
    option_form.self = option_form.container.find('form[name="options"]')
    option_form.toggle = option_form.container.find('.toggle')
    // initially hide option form

    function centerOptionForm () {
      var new_position = viewport.center_y - (option_form.container_height) / 2
      option_form.container.css({
        'top': new_position + 'px'
      })
    }

    function enableToggleOptionForm () {
      option_form.toggle.click(function () {
        option_form.container.toggleClass('toggled')
      })
    }

    function blinkingCursor () {
      var caret_offset = input_form.query_input.caret('offset')
      var cursor_position = caret_offset.left - input_form.marker.width()
      input_form.marker.css({
        'left': cursor_position + 'px'
      })
    }

    function setFocusToQueryInput () {
      input_form.query_input.focus()
    }

    function glow (element) {
      element = $(element)
      element.addClass('glow')
      var glow_check_interval_id = window.setInterval(
        function () {
          element.removeClass('glow')
          clearInterval(glow_check_interval_id)
        }, 250
      )
    }

    // handle input of query form
    function preventReloadingInputQuery () {
      input_form.self.submit(function (e) {
        glow(input_form.query_input)
        e.preventDefault()
      })
    }

    input_form.query_input.on('focus', function () {
      input_form.marker.show()
    })

    input_form.query_input.on('blur', function () {
      input_form.marker.hide()
    })

    // center option form vertically
    centerOptionForm()
    // enable toggling of the option form element
    enableToggleOptionForm()
    // initially set focus on query input field and update cursor position and prevent input query
    // from reloading page in submit
    setFocusToQueryInput()
    blinkingCursor()
    preventReloadingInputQuery()
    // simulate blinking cursor at end of input
    input_form.query_input.on('input click keydown keyup', function () {
      blinkingCursor()
    })
  }
}(jQuery))
console.log('gui module initialized')
