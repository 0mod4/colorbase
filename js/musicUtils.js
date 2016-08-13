	    /*SOUND ANALYZER*/
	    var aCont = new AudioContext();
	    var soundAnalyzer;
	    var musicBuffer;
	    var scriptProcessor;
	    var source;
	    var soundBars;
	    var nSoundBars;

	    function initSoundAnalyzer()
	    {
	        // setup a javascript node
	        scriptProcessor = aCont.createScriptProcessor(4096, 1, 1); //2048

	        // setup a analyzer
	        soundAnalyzer = aCont.createAnalyser();
	        soundAnalyzer.smoothingTimeConstant = 0.3;
	        soundAnalyzer.fftSize = 512;

	        // we use the javascript node to draw at a specific interval.
	        soundAnalyzer.connect(scriptProcessor);

		    scriptProcessor.onaudioprocess = function() {

		        // get the average, bincount is fftsize / 2
		        var array =  new Uint8Array(soundAnalyzer.frequencyBinCount);
		        soundAnalyzer.getByteFrequencyData(array);
		        getSoundBars(array);
		    }

		    function getSoundBars(array) {
		        soundBars = [];
		        var length = array.length;
		 		var barWidth = Math.floor(length/nSoundBars);
		 		var values;

		 		for(var c=0; c<nSoundBars-1; c++)
		 		{
		        	values = 0;
		 			for(var i=0; i<barWidth; i++)
		 			{
		 				values += array[c*barWidth + i];
		 			}
		 			soundBars.push(values/barWidth);
		 		}

		 		//last bar eventually takes more frequencies
		 		values = 0;
		 		for(var i=(nSoundBars-1)*barWidth+1; i<length; i++)
		 		{
		 			values += array[i];
		 		}
		 		soundBars.push(values/(length-((nSoundBars-1)*barWidth+1)));
		    }
	    }

	    // log if an error occurs
	    function onError(e) {
	        console.log(e);
	    }

	    function loadSound(url) {
	        var request = new XMLHttpRequest();
	        request.open('GET', url, true);
	        request.responseType = 'arraybuffer';

	        // When loaded decode the data
	        request.onload = function() {
	            // decode the data
	            aCont.decodeAudioData(request.response, function(buffer) {
	                musicBuffer = buffer;
	            }, onError);
	        }
	        request.send();
	    }

		function playSound() {
		  source = aCont.createBufferSource();
		  source.connect(soundAnalyzer);
		  source.buffer = musicBuffer;
		  source.connect(aCont.destination);
		  scriptProcessor.connect(aCont.destination);
		  source.start(0);
		}

	    function stopSound() {
	    	scriptProcessor.disconnect();
	    	source.stop();
	    }