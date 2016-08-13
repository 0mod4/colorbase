'use strict';
(function ($) {
  var scroller = []
  var check_scroller_interval_id = ''
  var greeting_reset_interval_id = ''

  $.fn.initScroller = function () {
    scroller.self = $('div.greetings')
    scroller.content = scroller.self.find('p')
    scroller.base_path = getBaseURL()
    scroller.source_path = scroller.base_path + '/greetz.txt'
    scroller.characters = []
    scroller.greeting_string = ''

    function getBaseURL () {
      var getUrl = window.location
      var baseUrl = getUrl .protocol + '//' + getUrl.host + '/' + getUrl.pathname.split('/')[1]
      return baseUrl
    }

    function createChars (path_of_greetings_file) {
      $.get(path_of_greetings_file, function (data) {
        scroller.characters = data.split('')
        for (var character of scroller.characters) {
          if (!isInvalidCharacter(character)) {
            scroller.greeting_string = scroller.greeting_string + character
          }
        }
        $('div.greetings').append('<span class="text">' + scroller.greeting_string + '</span>')
      }, 'text')
    }

    function isInvalidCharacter (character) {
      var character_is_invalid = false
      if (!/[\*A-Za-z0-9\n \!\.-\_]/.test(character)) {
        character_is_invalid = true
      }
      return character_is_invalid
    }

    function setScrollerStartPosition () {
      $('.greetings .text').css({
        'animation': 'greetings_wobble 1.5s infinite ease-in-out',
        'transform': 'translateX(' + parseInt(viewport.width + 80, 10) + 'px)'
      })
    }

    function setScrollerEndPosition () {
      $('.greetings .text').css({
        'transform': 'translateX(' + parseInt(-viewport.width - $('.greetings .text').width() - 80, 10) + 'px)'
      })
    }

    function setScrollerTransitionOn () {
      $('.greetings .text').css({
        'transition': 'transform ' + (scroller.greeting_string.length / 2) + 's linear'
      })
    }

    function setScrollerTransitionOff () {
      $('.greetings .text').css({
        'transition': 'none'
      })
    }

    function resetScrollerPosition () {
      //// THIS DOES NOT WORK (AND PROBABLY NEVER WILL) ////
      //// IF YOU FEEL GENEROUS OR BORED FEEL FREE TO TRY TO COMPLETE IT
      // if ($('div.greetings .text').offset().left <= parseInt(-$('div.greetings .text').width(), 10)) {
      //   console.log('reset')
      //   clearInterval(greeting_reset_interval_id)
      //   // move scroller outside viewport
      //   setScrollerTransitionOff()
      //   setScrollerStartPosition()
      //   // move scroller over the screen to the other side outside viewport
      //   setScrollerTransitionOn()
      //   setScrollerEndPosition()
      // }
    }

    function scrollerCreated () {
      if ($('div.greetings .text').length > 0) {
        clearInterval(check_scroller_interval_id)
        // move scroller outside viewport
        setScrollerTransitionOff()
        setScrollerStartPosition()
        // move scroller over the screen to the other side outside viewport
        setScrollerTransitionOn()
        setScrollerEndPosition()
      }
    }

    // initially create characters based on file contents
    createChars(scroller.source_path)

    check_scroller_interval_id = window.setInterval(
      function () {
        scrollerCreated()
      }
    , 500)
    // greeting_reset_interval_id = window.setInterval(
    //   function () {
    //     resetScrollerPosition()
    //   }
    // , 1000
    // )
  }

  $.fn.removeScroller = function () {
    scroller.content.remove()
  }
}(jQuery))
console.log('greetings scroller initialized')
