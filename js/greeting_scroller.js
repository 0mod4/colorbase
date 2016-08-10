(function ($) {
  var scroller = []
  var greeting_interval_id

  $.fn.initScroller = function () {
    scroller.self = $('div.greetings')
    scroller.content = scroller.self.find('p')
    scroller.base_path = getBaseURL()
    scroller.source_path = scroller.base_path + '/greetz.txt'
    scroller.character_width = 80 // this is a wild guess
    scroller.character_initial_offset = viewport.width + scroller.character_width + 'px'

    function getBaseURL () {
      var getUrl = window.location
      var baseUrl = getUrl .protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[1]
      return baseUrl
    }

    function createChars (path_of_greetings_file) {
      var char_array = []
      $.get(path_of_greetings_file, function (data) {
        char_array = data.split('')
        renderChars(char_array)
      }, 'text')
    }

    function renderChars (char_array) {
      for (var character of char_array) {
        renderChar(character)
      }
    }

    function renderChar (character) {
      if (!isInvalidCharacter(character)) {
        $(scroller.self).append('<p class="char" style="left: ' + scroller.character_initial_offset + '">' + character + '</p>')
      }
    }

    function isInvalidCharacter (character) {
      var character_is_invalid = false
      if (!/[\*A-Za-z0-9\n \!\.-\_]/.test(character)) {
        character_is_invalid = true
      }
      return character_is_invalid
    }

    function setFinalCharPosition (chars) {
      for (var char of chars) {
        char = $(char)
        if (!char.hasClass('final')) {
          char.css({
            'left': '-' + scroller.character_width + 'px',
            'animation': 'greetings_wobble 1.5s infinite ease-in-out'
          })
          char.addClass('final')
          break
        }
      }
    }

    createChars(scroller.source_path)
    // every 3 seconds, set the final position of one greeting character, animation does the rest
    greeting_interval_id = window.setInterval(
      function () {
        setFinalCharPosition($('div.greetings').find('p.char'))
      }
    , 550)
  }
}(jQuery))
console.log('greetings scroller initialized')
