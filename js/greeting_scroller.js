(function ($) {
  var scroller = []
  var check_scroller_interval_id
  var current_top

  $.fn.initScroller = function () {
    scroller.self = $('div.greetings')
    scroller.content = scroller.self.find('p')
    scroller.source_path = 'greetz.txt'
    scroller.greeting_string = ''
    scroller.characters = []

    // get text from file and put into array
    function createChars (path_of_greetings_file) {
      var char_array = []
      $.get(path_of_greetings_file, function (data) {
        scroller.characters = data.split('')
        renderGreetings()
      }, 'text')
    }

    // render text from array into single dom element
    function renderGreetings () {
      for (var character of scroller.characters) {
        if (!isInvalidCharacter(character)) {
          scroller.greeting_string = scroller.greeting_string + character
        }
      }
      $('div.greetings').append('<span class="text">' + scroller.greeting_string + '</span>')
    }

    function isInvalidCharacter (character) {
      var character_is_invalid = false
      if (!/[\*A-Za-z0-9\n \!\.-\_]/.test(character)) {
        character_is_invalid = true
      }
      return character_is_invalid
    }

    function isScrollerCreated () {
      if ($('div.greetings .text').length > 0) {
        // if scroller text is present, delete periodic check
        clearInterval(check_scroller_interval_id)
        scrollText()
      }
    }

    function scrollText() {
      current_top = parseInt($('.text').css('top'), 10)
      new_top = current_top - 80
      $('.text').css('top', new_top + 'px')
    }

    createChars(scroller.source_path)
    // check periodically if scroller text created before interacting with it
    check_scroller_interval_id = window.setInterval(
      function () {
        isScrollerCreated()
      }
    , 550)
    scroll_scroller_interval_id = window.setInterval(
      function () {
        scrollText()
        console.log('fired scroller')
      }
    , 10000)
  }
}(jQuery))
console.log('greetings scroller initialized')
