//http://www.smartjava.org/examples/webaudio/example2.html
    var rows = 50;
    var cols = 50;
    var error = "";
    var parsedSelect;
    var clearColor = [255,255,255];
    var musicColor1 = [255,0,0];
    var musicColor2 = [0,0,255];

    var online = navigator.onLine;
    var video = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	            navigator.mozGetUserMedia || navigator.msGetUserMedia);

    var db;

    var context = new AudioContext();
    var audioBuffer;
    var source;
    var scriptProcessor;
    var musicBuffer;
    var soundAnalyzer;
    var soundBars;
    var musicIntervalID;

	var videoSource;
	var videoIntervalID;

    /*TABLE CREATION*/
    function createDefaultTable() {
	    db.run("CREATE TABLE dummy (x,y,r,g,b);");
	    var values = [];
	    for(var x=0; x<rows; x++)
	    {
	    	for(var y=0; y<cols; y++)
	    	{
	    		values.push("("+x);
	    		values.push(y);
	    		if(x==y)
	    		{
	    			values.push(200);
	    			values.push(20);
	    			values.push("100)");
	    		}
	    		else
	    		{
	    			values.push(0);
	    			values.push(50);
	    			values.push("200)");
	    		}
	    	}
	    }
    	db.run("INSERT INTO dummy VALUES "+values.join());
    }

    function createMusicTable() {
    	db.run("CREATE TABLE MUSIC (x,y,r,g,b);");
	    for(var x=0; x<rows; x++)
	    {
	    	for(var y=0; y<cols; y++)
	    	{
	    		db.run("INSERT INTO MUSIC VALUES (?,?,?,?,?)", [x,y,0,0,0]);
	    	}
	    }
    }

    function createVideoTable() {
    	db.run("CREATE TABLE VIDEO (x,y,r,g,b);");
    	for(var x=0; x<rows; x++)
    	{
    		for(var y=0; y<cols; y++)
    		{
    			db.run("INSERT INTO VIDEO VALUES (?,?,?,?,?)", [x,y,0,0,0]);
    		}
    	}
    }

    /*TABLE UPDATES*/
    function updateMusicTable() {
    	db.run("UPDATE MUSIC SET r=?, g=?, b=?",[clearColor[0],clearColor[1],clearColor[2]]);
    	if(!(typeof soundBars === 'undefined')) //no music playing
    	{
	    	var n = $("#numSoundBars").val();
	    	var num = 1;
	    	//calculate width of one sound bar
	    	if(cols > n) //more cols than soundbars
	    		num = Math.round(cols/n);
	    	//get max of all current soundbars
	    	var max = soundBars[0];
	    	var min = soundBars[0];
	    	for(var sb=1; sb<n; sb++)
	    	{
	    		if(soundBars[sb] > max)
	    			max = soundBars[sb];
	    		if(soundBars[sb] < min)
	    			min = soundBars[sb];
	    	}
	    	//map span of soundbars to rows
	    	var diffPerCell = (max-min)/rows;
	    	diffPerCell = 200/rows; //test
	    	for(var sb=0; sb < n; sb++) //for all current sound bars
	    	{
	    		var cursb;
	    		if(typeof soundBars[sb] === 'undefined') //not filled
	    			cursb = 0;
	    		else
	    			cursb = soundBars[sb];
	    		sbHeight = Math.floor(cursb/diffPerCell);

	    		/*
	    		var a = 1.0/sbHeight;
	    		var b = 1-rows/parseFloat(sbHeight);
	    		var r,g,b;
	    		var alpha;
	    		for(var y=rows-sbHeight; y<rows; y++) //fill rowwise (to get gradient)
	    		{
	    			alpha = a*y+b;
	    			r = alpha*musicColor1[0]+(1-alpha)*musicColor2[0];
	    			g = alpha*musicColor1[1]+(1-alpha)*musicColor2[1];
	    			b = alpha*musicColor1[2]+(1-alpha)*musicColor2[2];
	    			db.run("UPDATE MUSIC SET r=?, g=?, b=? WHERE y=? AND x BETWEEN ? AND ?", [r,g,b,y,sb*num,(sb+1)*num-1]);
	    		}*/

	    		db.run("UPDATE MUSIC SET r=?, g=?, b=? WHERE y>? AND x BETWEEN ? AND ?", [musicColor1[0],musicColor1[1],musicColor1[2],rows-sbHeight,sb*num,(sb+1)*num-1]);
	    	}
    	}
    }

    /*MUSIC*/
    // load the specified sound
    function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
 
        // When loaded decode the data
        request.onload = function() {
            // decode the data
            context.decodeAudioData(request.response, function(buffer) {
                musicBuffer = buffer;
            }, onError);
        }
        request.send();
    }

	function playSound() {
	  source = context.createBufferSource();
	  source.connect(soundAnalyzer);
	  source.buffer = musicBuffer;               
	  source.connect(context.destination);
	  scriptProcessor.connect(context.destination);
	  source.start(0);                           
	}

    function stopSound() {
    	scriptProcessor.disconnect();
    	source.stop();
    }
 
 	function toggleMusic() {
 		if(online)
 		{
	 		if($("#playMusic").prop( "checked" )) //start music
	 			playSound();
	 		else
	 		{
	 			stopSound();
				if(typeof musicIntervalID !== undefined) //an interval is active, stop it
				{
					clearInterval(musicIntervalID);
				}
	 		}
 		}
 		else
 		{
 			alert("No Internet - no music!");
 		}
 	}
    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    /*SOUND ANALYZER*/
    function initSoundAnalyzer()
    {
        // setup a javascript node
        scriptProcessor = context.createScriptProcessor(4096, 1, 1); //2048
 
        // setup a analyzer
        soundAnalyzer = context.createAnalyser();
        soundAnalyzer.smoothingTimeConstant = 0.3;
        soundAnalyzer.fftSize = 512;
 
        // we use the javascript node to draw at a specific interval.
        soundAnalyzer.connect(scriptProcessor);

	    scriptProcessor.onaudioprocess = function() {
	 
	        // get the average, bincount is fftsize / 2
	        var array =  new Uint8Array(soundAnalyzer.frequencyBinCount);
	        soundAnalyzer.getByteFrequencyData(array);
	        getSoundBars(array, $("#numSoundBars").val());
	    }
	 
	    function getSoundBars(array, n) {
	        soundBars = [];
	        var length = array.length;
	 		var barWidth = Math.floor(length/n);
	 		var values;

	 		for(var c=0; c<n-1; c++)
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
	 		for(var i=(n-1)*barWidth+1; i<length; i++)
	 		{
	 			values += array[i];
	 		}
	 		soundBars.push(values/(length-((n-1)*barWidth+1)));
	    }
    }

    /*VIDEO*/
	function initVideo()
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

	    if(typeof videoIntervalID !== undefined) //an interval is active, stop it
	    {
	        clearInterval(videoIntervalID);
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

	function toggleVideo()
	{
	    var video = true;
	    if(video)
	    {
	        if($("#useVideo").prop( "checked" )) //start video
	            useVideo();
	        else
	        {
	            stopVideo();
	            if(typeof videoIntervalID !== undefined) //an interval is active, stop it
	            {
	                clearInterval(videoIntervalID);
	            }
	        }
	    }
	    else
	    {
	        alert("Webcam access is not supported in your browser");
	    }
	}

	function updateVideoTable()
	{
	    var values = [];
	    for(var x=0; x<rows; x++)
	    {
	    	for(var y=0; y<cols; y++)
	    	{
	    		values.push("("+x);
	    		values.push(y);
	    		if(x==y)
	    		{
	    			values.push(200);
	    			values.push(20);
	    			values.push("100)");
	    		}
	    		else
	    		{
	    			values.push(0);
	    			values.push(50);
	    			values.push("200)");
	    		}
	    	}
	    }
    	db.run("INSERT INTO dummy VALUES "+values.join());


		if($("#useVideo").prop( "checked" ))
		{
		    var c = document.getElementById('videoCanvas');
		    var v = document.getElementById('camFeed');
		    c.getContext('2d').drawImage(v, 0, 0, cols, rows);
		    var data = c.getContext('2d').getImageData(0, 0, cols, rows).data;

		    var x,y;
/*
		    for (var s=0; s<data.length; s=s+4)
		    {
		    	x = (s/4)%cols;
		    	y = Math.floor((s/4)/rows);
	    		db.run("UPDATE VIDEO SET r=?, g=?, b=? WHERE x=? AND y=?", [data[s],data[s+1],data[s+2],x,y]);
		    }*/

		    db.run("DELETE FROM VIDEO");

		    var values = [];
		    for(var x=0; x<cols; x++)
		    {
		    	for(var y=0; y<rows; y++)
		    	{
		    		s = (y*cols+x)*4;
	    			values.push("("+x);
	    			values.push(y);
	    			values.push(data[s]);
	    			values.push(data[s+1]);
	    			values.push(data[s+2]+")");
		    	}
		    }
		    db.run("INSERT INTO VIDEO VALUES "+values.join());
		}
		else{
			db.run("UPDATE VIDEO SET r=?, g=?, b=?",[clearColor[0],clearColor[1],clearColor[2]]);
		}
	}

    /*EXECUTING*/
    function clearIntervals()
    {
		if(typeof musicIntervalID !== undefined) //an interval is active, stop it
		{
			clearInterval(musicIntervalID);
		}
		if(typeof musicIntervalID !== undefined) //an interval is active, stop it
		{
			clearInterval(videoIntervalID);
		}
    }

    function execute(){
		var statement = $("#queryText").val();
		
		clearIntervals();

		if(statement.toUpperCase().indexOf("MUSIC") > -1) //selects from Music table
		{
			musicIntervalID = window.setInterval(function() {updateMusicTable(); query(statement); }, 100);
		}
		if(statement.toUpperCase().indexOf("VIDEO")> -1) //selects from Video table
		{
			videoIntervalID = window.setInterval(function() {updateVideoTable(); query(statement); }, 100);
		}
		else
		{
			query(statement);
		}
    }

	function query(statement) {
		var result = [];
		var stmt = db.prepare(statement);
		if(stmt)
		{
			while(stmt.step()) {
		        var row = stmt.getAsObject();
		        result.push(row);
		    }
		}
		else
		{
			alert("Could not process statement");
		}
		if(result.length > 0)
		{
			showResult2D(result);
		}
		else
		{
			alert("Empty result");
			clearIntervals();
		}
  	}

  	function showResult2D(result)
  	{
  		//check if given result is of needed format
  		if(!("x" in result[0]))
  			alert("no x value selected");
  		if(!("y" in result[0]))
  			alert("no y value selected");
  		if(!("r" in result[0]))
  			alert("no r value selected");
  		if(!("g" in result[0]))
  			alert("no g value selected");
  		if(!("b" in result[0]))
  			alert("no b value selected");

  		var transition = $('input[name="Transition"]:checked').val();
  		switch(transition) {
		    case "in":
				instantTransition(result);
		        break;
/*		    case "del":
		    	var prevTime = Date.now();
		        for(i=0; i<rows; i++)
		        {
		        	for(j=0; j<cols; j++)
		        	{
				  		for(c=0; c<result.length; c++)
				  		{
				  			colorSet = false;
				  			var id = [i,j];
				  			if(id == [Math.round(result[c][0]), Math.round(result[c][1])]) //current cell contained in result
				  			{
				  				$("#cell"+id.join("-")).css({backgroundColor: "rgb("+Math.round(result[c][2])+","+Math.round(result[c][3])+","+Math.round(result[c][4])+")"});
				  			}
				  			colorSet = true;
				  		}
				  		if(!colorSet)
				  		{
				  			$("#cell"+id.join("-")).css({backgroundColor: "rgb("+clearColor[0]+","+clearColor[1]+","+clearColor[2]+")"});
				  		}
						//while(Date.now()-prevTime < 2)
							console.log(Date.now()-prevTime);
						prevTime = Date.now();
		        	}
		        }
		        break;*/
		    default:
		        instantTransition(result);
		}
  	}

  	function clamp(val, min, max)
  	{
			return Math.min(Math.max(val, min), max);
  	}

  	function instantTransition(result)
  	{
		$("#container").children().css({backgroundColor: "rgb("+clearColor[0]+","+clearColor[1]+","+clearColor[2]+")"});
  		for(i=0; i<result.length; i++)
  		{
  			var r = clamp(Math.round(result[i].r), 0, 255);
  			var g = clamp(Math.round(result[i].g), 0, 255);
  			var b = clamp(Math.round(result[i].b), 0, 255);
  			var id = [Math.round(result[i].x), Math.round(result[i].y)]; //need x,y,r,g,b
  			$("#cell"+id.join("-")).css({backgroundColor: "rgb("+r+","+g+","+b+")"});
  		}
  	}

  	/*INITIALIZATION*/
  	function init()
  	{
		//build grid
		$("body").append("<div id='container'></div>");
		for(i=0;i<rows;i++){
			for(j=0;j<cols;j++){
				var id = [j,i];
				$("#container").append("<div class='cell' id=cell"+id.join("-")+"></div>");
				//$("#container").children().css({float: "left", width:"50px", height:"50px"});
			}
		}

		var x = ($('.cell').width() * cols);
		var y = (parseInt($('.cell').css('margin-left')) * cols)
		var containerWidth = x + y
  		$("#container").css({'width':containerWidth+'px'})

  		//db connection
  		db = new SQL.Database();

  		//create tables
  		createDefaultTable();
  		createMusicTable();
  		createVideoTable();

  		//Init Music
  		if(online)
  		{
	    	initSoundAnalyzer();
	    	loadSound("https://www.freesound.org/data/previews/256/256458_4772965-lq.mp3");
  		}
  		else
  		{
  			alert("No internet - no music");
  		}

  		if(video)
  		{
  			initVideo();
  		}
  		else
  		{
  			alert("Your browser does not support GetUserMedia()");
  		}
  	}