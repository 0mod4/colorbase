(function ($) {
  var scroller = []
  var greeting_interval_id

  $.fn.initScroller = function () {
    scroller.self = $('div.greetings')
    scroller.content = scroller.self.find('p')
    scroller.source_path = '/greetz.txt'
    scroller.character_width = 80 // this is a wild guess
    scroller.character_initial_offset = viewport.width + scroller.character_width + 'px'

    function createChars (path_of_greetings_file) {
      var char_array = []
      $.get(path_of_greetings_file, function (data) {
        char_array = data.split('')
        //renderGreetings(char_array)
      }, 'text')
    }

    function renderChars (char_array) {
      for (var character of char_array) {
        if (!isInvalidCharacter(character)) {
          $(scroller.self).append('<p class="char" style="left: ' + scroller.character_initial_offset + '">' + character + '</p>')
        }
      }
    }

    function isInvalidCharacter (character) {
      var character_is_invalid = false
      if (!/[\*A-Za-z0-9\n \!\.-\_]/.test(character)) {
        character_is_invalid = true
      }
      return character_is_invalid
    }

    createChars(scroller.source_path)
  }
}(jQuery))
console.log('greetings scroller initialized')
