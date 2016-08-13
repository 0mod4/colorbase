'use strict';
(function ($) {
  var scroller = []
  var id = 0
  var greeting_interval_id = ''
  var greeting_reset_interval_id = ''
  var character_transition = ''

  $.fn.initScroller = function () {
    scroller.self = $('div.greetings')
    scroller.content = scroller.self.find('p')
    scroller.base_path = getBaseURL()
    scroller.source_path = scroller.base_path + '/greetz.txt'
    scroller.greeting_length = 0
    scroller.characters = []

    function getBaseURL () {
      var getUrl = window.location
      var baseUrl = getUrl .protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[1]
      return baseUrl
    }

    function createChars (path_of_greetings_file) {
      $.get(path_of_greetings_file, function (data) {
        scroller.characters = data.split('')
        renderChars()
      }, 'text')
    }

    function renderChars () {
      for (var character of scroller.characters) {
        renderSingleChar(character)
      }
    }

    function renderSingleChar (character) {
      if (!isInvalidCharacter(character)) {
        $(scroller.self).append('<p class="char id' + id + '">' + character + '</p>')
        id++
      }
    }

    function setCharsPosition () {
      var chars_starting_position = viewport.width + 80
      // var chars_starting_position = 0
      var char_elements = $('div.greetings').find('p.char')
      var last_element_width = 0
      scroller.greeting_length = chars_starting_position

      for (var element of char_elements) {
        if (isEmpty($(element))) {
          last_element_width = last_element_width + 50
        }
        scroller.greeting_length = scroller.greeting_length + last_element_width + 30
        $(element).css({'transform': 'translateX(' + scroller.greeting_length + 'px)'})
        last_element_width = $(element).width()
      }
    }

    function setFinalCharsPosition () {
      var char_elements = $('div.greetings').find('p.char')
      var current_position = 0
      var new_position = 0

      for (var element of char_elements) {
        current_position = $(element).css('transform').split(',')[4]
        new_position = current_position - viewport.width - scroller.greeting_length
        $(element).css({
          'transform': 'translateX(' + new_position + 'px)',
          'transition': 'transform ' + (char_elements.length / 2) + 's linear'
        })
      }
    }

    function resetCharsPosition () {
      if ($('.char:last').offset().left < -80) { // last char has left the viewport
        var char_elements = $('div.greetings').find('p.char')
        var current_position = 0
        var new_position = 0

        for (var element of char_elements) {
          $(element).css('transition', 'none')
          current_position = $(element).css('transform').split(',')[4]
          console.log($(element).css('transform'))
          new_position = current_position + viewport.width + scroller.greeting_length
          // $(element).css({
          //   'transform': 'translateX(' + new_position + 'px)',
          //   'transition': 'transform ' + (char_elements.length / 2) + 's linear'
          // })
        }
      }
    }

    function isEmpty (element) {
      return !$.trim(element.html())
    }

    function isInvalidCharacter (character) {
      var character_is_invalid = false
      if (!/[\*A-Za-z0-9\n \!\.-\_]/.test(character)) {
        character_is_invalid = true
      }
      return character_is_invalid
    }

    function allCharsCreated () {
      var all_chars = scroller.characters.length
      if ($('div.greetings').children().length >= all_chars) {
        clearInterval(greeting_interval_id)
        setCharsPosition()
        setFinalCharsPosition()
      }
    }

    // initially create characters based on file contents
    createChars(scroller.source_path)
    setCharsPosition()

    greeting_interval_id = window.setInterval(
      function () {
        allCharsCreated()
      }
    , 500)
    greeting_reset_interval_id = window.setInterval(
      function () {
        resetCharsPosition()
      }
    , 1000
    )
  }

  $.fn.removeScroller = function () {
    clearInterval(greeting_interval_id)
    scroller.content.remove()
  }
}(jQuery))
console.log('greetings scroller initialized')
