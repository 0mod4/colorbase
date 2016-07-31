//http://www.smartjava.org/examples/webaudio/example2.html
var ThreeD = (function() {

	    var error = "";
	    var emptyData = [];
	    var parsedSelect;
	    var clearColor = [255,255,255,0.25];
	    var musicColor = [255,0,0,1];
	    var moveColor = [255,142,0,1];

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

		var videoSource;

	    var musicIntervalID = 0;
		var videoIntervalID = 0;
		var moveIntervalID = 0;
		var queryIntervalID = 0;

		var prevData = []; //needed for motion detection

	    /*TABLE CREATION*/
	    function createEmptyData() {
		    for(var x=0; x<rows; x++)
		    {
		    	for(var y=0; y<cols; y++)
		    	{
		    		for(var z=0; z<peter; z++)
		    			emptyData.push("("+x+","+y+","+z+","+clearColor[0]+","+clearColor[1]+","+clearColor[2]+","+clearColor[3]+")");
		    	}
		    }
	    }

	    function createDefaultTable() {
		    db.run("CREATE TABLE dummy (x,y,z,r,g,b,a);");
		    var values = [];
		    for(var x=0; x<rows; x++)
		    {
		    	for(var y=0; y<cols; y++)
		    	{
		    		for(var z=0; z<peter; z++)
		    		{
			    		values.push("("+x+","+y+","+z);
			    		if(x==y)
			    		{
			    			values.push(z/parseFloat(peter)*255+", 20, 100, 1)");
			    		}
			    		else
			    		{
			    			values.push("0,50,200,0.5)");
			    		}
			    	}
		    	}
		    }
	    	db.run("INSERT INTO dummy VALUES "+values.join());
	    }

	    function createMusicTable() {
	    	db.run("CREATE TABLE MUSIC (x,y,z,r,g,b,a);");
	    	db.run("INSERT INTO MUSIC VALUES "+emptyData.join());
	    }

	    function createVideoTable() {
	    	db.run("CREATE TABLE VIDEO (x,y,z,r,g,b,a);");
	   		db.run("INSERT INTO VIDEO VALUES "+emptyData.join());
	    }

	    /*TABLE UPDATES*/
	    function updateMusicTable() {
	    	console.log("update Music Table");
	    	db.run("UPDATE MUSIC SET r=?, g=?, b=?, a=?",[clearColor[0],clearColor[1],clearColor[2],clearColor[3]]);
	    	if(typeof soundBars !== 'undefined') //no music playing
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
		    	diffPerCell = 300/rows;
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

		    		db.run("UPDATE MUSIC SET r=?, g=?, b=?, a=? WHERE y>? AND x BETWEEN ? AND ?", [musicColor[0],musicColor[1],musicColor[2],musicColor[3],rows-sbHeight,sb*num,(sb+1)*num-1]);
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
	 		if($("#playMusic").prop( "checked" )) //start music
	 		{
	 			playSound();
	        	if((queryIntervalID > 0) && ($("#queryText").val().indexOf("MUSIC")> -1))
	        		if(musicIntervalID == 0)
	        			musicIntervalID = window.setInterval(function() {updateMusicTable();})
	 		}
	 		else
	 		{
	 			stopSound();
				if(musicIntervalID > 0) //an interval is active, stop it
				{
					clearInterval(musicIntervalID);
					musicIntervalID = 0;
				}
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
		        getVol(array);
		    }

		    function getVol(array) {
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

		function toggleVideo()
		{
		    if(video)
		    {
		        if($("#useVideo").prop( "checked" )) //start video
		        {
		            useVideo();
		        	if((queryIntervalID > 0) && ($("#queryText").val().indexOf("VIDEO")> -1))
		        	{
		        		if(videoIntervalID == 0)
		        		{console.log("start video interval");
		        			videoIntervalID = window.setInterval(function() {updateVideoTable();})
		        		}
		        	}
		        }
		        else
		        {
		            stopVideo();
		            if(videoIntervalID > 0) //an interval is active, stop it
		            {
		                clearInterval(videoIntervalID);
		                videoIntervalID = 0;
		            }
		        }
		    }
		    else
		    {
		        alert("Webcam access is not supported in your browser");
		    }
		}

		function updateVideoTable()
		{console.log("update video")
			if($("#useVideo").prop( "checked" ))
			{
			    var c = document.getElementById('videoCanvas');
			    var v = document.getElementById('camFeed');
			    c.getContext('2d').drawImage(v, 0, 0, cols, rows);
			    var data = c.getContext('2d').getImageData(0, 0, cols, rows).data;
			    var values = [];
			    db.run("DELETE FROM VIDEO");
			    for(var x=0; x<cols; x++)
			    {
			    	for(var y=0; y<rows; y++)
			    	{
			    		s = (y*cols+x)*4;
		    			values.push("("+x+","+y);
		    			values.push(data[s]);
		    			values.push(data[s+1]);
		    			values.push(data[s+2]+",1)");
			    	}
			    }
			    db.run("INSERT INTO VIDEO VALUES "+values.join());
			}
			else{
				db.run("UPDATE VIDEO SET r=?, g=?, b=?, a=?",[clearColor[0],clearColor[1],clearColor[2],clearColor[3]]);
			}
		}

		function compareColor(a,b) {
			var sensitivity = 40;
			a = Math.round(a/10)*10;
			b = Math.round(b/10)*10;
			var match = true;

			if(a!=b){
				if((a+sensitivity < b || a-sensitivity > b))
					match = false;
			}

			return match;
		}

		function comparePixel(r1,g1,b1,r2,g2,b2) {
			var matches = compareColor(r1,r2) && compareColor(g1,g2) && compareColor(b1,b2);
			return matches;
		}

		function updateMoveTable()
		{
			if($("#useVideo").prop( "checked" ))
			{
			    var c = document.getElementById('videoCanvas');
			    var v = document.getElementById('camFeed');
			    c.getContext('2d').drawImage(v, 0, 0, cols, rows);
			    var data = c.getContext('2d').getImageData(0, 0, cols, rows).data;//Math.floor(cols/2.0), Math.floor(rows/2.0)).data;
			    if(typeof prevData[data.length-1] !== undefined)
			    {
				    db.run("DELETE FROM MOVE");
				    //compare pixels
				    var values = [];
				    for(var x=0; x<cols; x++)//Math.floor(cols/2.0); x++)
				    {
				    	for(var y=0; y<rows; y++)//Math.floor(rows/2.0); y++)
				    	{
				    		values.push("("+x+","+y);
				    		s = (y*cols+x)*4;
				    		if(!comparePixel(data[s], data[s+1], data[s+2], prevData[s], prevData[s+1], prevData[s+2]))
				    		{
				    			values.push(moveColor[0]+","+moveColor[1]+","+moveColor[2]+","+moveColor[3]+")");
				    		}
				    		else
				    		{
				    			values.push(clearColor[0]+","+clearColor[1]+","+clearColor[2]+","+clearColor[3]+")");
				    		}
				    	}
				    }

				    db.run("INSERT INTO MOVE VALUES "+values.join());
			    }
			    prevData = data;
			}
			else{
				db.run("UPDATE MOVE SET r=?, g=?, b=?, a=?",[clearColor[0],clearColor[1],clearColor[2],clearColor[3]]);
			}
		}

	    /*EXECUTING*/
	    function clearIntervals()
	    {
			if(musicIntervalID > 0) //an interval is active, stop it
			{
				clearInterval(musicIntervalID);
				musicIntervalID = 0;
			}
			if(musicIntervalID > 0) //an interval is active, stop it
			{
				clearInterval(videoIntervalID);
				videoIntervalID = 0;
			}
			if(moveIntervalID > 0) //an interval is active, stop it
			{
				clearInterval(moveIntervalID);
				moveIntervalID = 0;
			}
			if(queryIntervalID > 0) //an interval is active, stop it
			{
				clearInterval(queryIntervalID);
				queryIntervalID = 0;
			}
	    }

	    function intervalSet()
	    {
			if(musicIntervalID > 0)
			{
				return true;
			}
			if(videoIntervalID > 0)
			{
				return true;
			}
			if(moveIntervalID > 0)
			{
				return true;
			}
			return false;
	    }

	    function execute(){
			var statement = $("#queryText").val();

			clearIntervals();

			if(statement.indexOf("MUSIC") > -1) //selects from Music table
			{
				musicIntervalID = window.setInterval(function() {updateMusicTable(); }, 100);
			}
			if(statement.indexOf("VIDEO")> -1) //selects from Video table
			{
				videoIntervalID = window.setInterval(function() {updateVideoTable(); }, 100);
			}
			if(statement.indexOf("MOVE")>-1) //selects from MOVE table
			{
				moveIntervalID = window.setInterval(function() {updateMoveTable(); }, 100);
			}
			if(intervalSet())
			{
				queryIntervalID = window.setInterval(function() {query(statement); }, 100);
			}
			else
			{
				query(statement);
			}
	    }

		function query(statement) {
			console.log("query");
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
	  		var a_ = -1;
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
	  		if(!("a" in result[0]))
	  			a_ = 1;

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
		  			var a = 0;
		  			if(a_ != -1)
		  				a = a_;
		  			else
		  				a = clamp(result[i].a,0,1);
		  			var id = [Math.round(result[i].x), Math.round(result[i].y)];
		  			$("#cell"+id.join("-")).css({backgroundColor: "rgba("+r+","+g+","+b+","+a+")"});
		  		}
		  	}
	  	}

	    // INITIALIZATION
	    var gl;
	    function initGL(canvas) {
	        try {
	            gl = canvas.getContext("experimental-webgl");
	            gl.viewportWidth = canvas.width;
	            gl.viewportHeight = canvas.height;
	        } 
	        catch (e) 
	        {console.log(e);
	        }
	        if (!gl) 
	        {
	            alert("Could not initialize WebGL");
	        }
	    }

	    function getShader(gl, id) {
	        var shaderScript = document.getElementById(id);
	        console.log(shaderScript)
	        if (!shaderScript) {
	            return null;
	        }

	        var str = "";
	        var k = shaderScript.firstChild;
	        while (k) {
	        	console.log("has childs")
	            if (k.nodeType == 3) {
	                str += k.textContent;
	            }
	            k = k.nextSibling;
	        }

	        console.log("hier: "+str)

	        var shader;
	        if (shaderScript.type == "x-shader/x-fragment") {
	            shader = gl.createShader(gl.FRAGMENT_SHADER);
	        } else if (shaderScript.type == "x-shader/x-vertex") {
	            shader = gl.createShader(gl.VERTEX_SHADER);
	        } else {
	            return null;
	        }

	        gl.shaderSource(shader, str);
	        gl.compileShader(shader);

	        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	            alert("Error in shader: "+gl.getShaderInfoLog(shader));
	            return null;
	        }

	        return shader;
	    }


    	var shaderProgram;

	    function initShaders() {
	        var fragmentShader = getShader(gl, "shader-fs");
	        var vertexShader = getShader(gl, "shader-vs");

	        shaderProgram = gl.createProgram();
	        gl.attachShader(shaderProgram, vertexShader);
	        gl.attachShader(shaderProgram, fragmentShader);
	        gl.linkProgram(shaderProgram);

	        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	            console.log("Linker Error");
	        }

	        gl.useProgram(shaderProgram);

	        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	        shaderProgram.Nx = gl.getUniformLocation(shaderProgram, "Nx");
	        shaderProgram.Ny = gl.getUniformLocation(shaderProgram, "Ny");
	        shaderProgram.Nz = gl.getUniformLocation(shaderProgram, "Nz");
	    }

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    function setUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniform1f(shaderProgram.Nx, rows);
        gl.uniform1f(shaderProgram.Ny, cols);
        gl.uniform1f(shaderProgram.Nz, peter);
    }

    var triangleVertexPositionBuffer;
    var squareVertexPositionBuffer;

    function initBuffers() {
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;
    }


    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

        mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    }


	    function init() {
	    	//create canvas to draw in
	    	$('#container').append("<canvas class='drawCanvas' id='drawCanvas' style='border: none;' width='500' height='500'></canvas>")
		    var canvas = document.getElementById('drawCanvas');
		    initGL(canvas);
		    initShaders();
		    initBuffers();

		    gl.clearColor(0.0, 0.0, 0.0, 0.0);
		    gl.enable(gl.DEPTH_TEST);

		    drawScene();
	  	}

	    function cleanup()
	    {
	    	db.run("DROP TABLE dummy;");
	    	db.run("DROP TABLE VIDEO;");
	    	db.run("DROP TABLE MUSIC;");
	    	db.run("DROP TABLE MOVE;");
	    	db = null;

	    	$('#container .nestedElement').remove();
	    }

	  	return {
	  		init : function() {init();},
	  		execute : function() {execute();},
	  		cleanup : function() {cleanup();}
	  	};
})();