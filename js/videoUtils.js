		var videoSource;
	    var video = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
		            navigator.mozGetUserMedia || navigator.msGetUserMedia);

		function initVideo(rows, cols)
		{
			//create canvas to render the video in
			$('#videoCanvas').width(cols)
	    		.height(rows);

		    if(navigator.webkitGetUserMedia)
		    {
		        navigator.webkitGetUserMedia({video:true}, onSuccess, onFail);
		    }
		    else
		    {
		        alert('webRTC not available');
		    }
		}

		function useVideo()
		{
		    document.getElementById('camFeed').src = URL.createObjectURL(videoSource);
		}

		function stopVideo()
		{
		    document.getElementById('camFeed').src = '';//URL.createObjectURL(videoSource);

		    if(videoIntervalID > 0) //an interval is active, stop it
		    {
		        clearInterval(videoIntervalID);
		        videoIntervalID = 0;
		    }
		}

		function onSuccess(stream)
		{
		    videoSource = stream;
		}

		function onFail()
		{
		    alert('could not connect stream');
		}