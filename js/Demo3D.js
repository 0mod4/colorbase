'use strict'; /* globals $ dat OrbitControls */
var ThreeD = (function() {

	    var error = "";
	    var emptyData = [];
	    var parsedSelect;
	    var clearColor = [0,0,0,255];
	    var musicColor = [255,0,0,255];
	    var moveColor = [255,142,0,255];

	    var Nx = 12;
		var Ny = 12;
		var Nz = 12;
		var texWidth = 8192;

	    var db;

		var prevData = []; //needed for motion detection

		//modelview matrix
	    var mvMatrix = mat4.create();
		var rotMat = mat4.create();
    	mat4.identity(rotMat);

		/*MOUSE CONTROL*/
		var mouseDown = false;
		var lastMouseX = null;
		var lastMouseY = null;

		var drawDingsie;

		function degToRad(degrees) {
        	return degrees * Math.PI / 180;
    	}

		function handleMouseDown(event) {
		  	mouseDown = true;
		  	lastMouseX = event.clientX;
		  	lastMouseY = event.clientY;
		}

		function handleMouseUp(event) {
		  	mouseDown = false;
		}

		function handleMouseMove(event) {
			if (!mouseDown) {
			  return;
			}
			var newX = event.clientX;
			var newY = event.clientY;

		    var newRot = mat4.create();
		    mat4.identity(newRot);

		    var deltaX = newX - lastMouseX;
		    mat4.rotate(newRot, degToRad(deltaX / 10), [0, -1, 0]);

		    var deltaY = newY - lastMouseY;
		    mat4.rotate(newRot, degToRad(deltaY / 10), [-1, 0, 0]);

		    mat4.multiply(newRot, rotMat, rotMat);

		    lastMouseX = newX
		    lastMouseY = newY;
		}

	    /*TABLE CREATION*/
	    function createEmptyData() {
		    for(var x=0; x<Nx; x++)
		    {
		    	for(var y=0; y<Ny; y++)
		    	{
		    		for(var z=0; z<Nz; z++)
		    			emptyData.push("("+x+","+y+","+z+","+clearColor[0]+","+clearColor[1]+","+clearColor[2]+","+clearColor[3]+")");
		    	}
		    }
	    }

	    function createDefaultTable() {
		    db.run("CREATE TABLE SG4 (x,y,z,r,g,b,a);");
		    var values = [];
		    var mx = Nx/2.;
		    var my = Ny/2.;
		    var mz = Nz/2.;
		    var whiteCoords = [[mx-1,my-4,0],[mx,my-4,0],[mx-2,my-3,0],[mx+1,my-3,0],[mx-2,my-2,0],[mx-1,my-1,0],[mx,my,0],[mx+1,my+1,0],[mx-2,my+2,0],[mx+1,my+2,0],[mx-1,my+3,0],[mx,my+3,0],//S
								[mx-1,0,mz-2],[mx,0,mz-2],[Nx-1,my-3,mz-2],[Nx-1,my-2,mz-2],[Nx-1,my-1,mz-2],[Nx-1,my,mz-2],[Nx-1,my+1,mz-2],[Nx-1,my+2,mz-2],
								[mx-2,0,mz-1],[mx,0,mz-1],[Nx-1,my-4,mz-1],[Nx-1,my+3,mz-1],
								[mx-3,0,mz],[mx,0,mz],[Nx-1,my-4,mz],[Nx-1,my,mz],[Nx-1,my+3,mz],
								[mx-4,0,mz+1],[mx-3,0,mz+1],[mx-2,0,mz+1],[mx-1,0,mz+1],[mx,0,mz+1],[mx+1,0,mz+1],[mx+2,0,mz+1],[mx+3,0,mz+1],[Nx-1,my-3,mz+1],[Nx-1,my,mz+1],[Nx-1,my+1,mz+1],[Nx-1,my+2,mz+1]];
		    var whiteInd = 0;
		    var whiteCoord = whiteCoords[whiteInd];
		    for(var z=0; z<Nz; z++)
		    {
		    	for(var y=0; y<Ny; y++)
		    	{
		    		for(var x=0; x<Nx; x++)
		    		{
			    		values.push("("+x+","+y+","+z);
			    		if((x>0)&&(x<Nx-1)&&(y>0)&&(y<Ny-1)&&(z>0)&&(z<Nz-1))//Core, gray
			    		{
			    			values.push("25,25,25,255)");
			    		}
			    		else //outer layer: transparent
			    		{
			    			if((whiteInd < whiteCoords.length) && (whiteCoord[0] == x) && (whiteCoord[1] == y) && (whiteCoord[2] == z))
			    			{
			    				values.push("255,255,255,255)");
			    				whiteInd++;
			    				whiteCoord = whiteCoords[whiteInd];
			    			}
			    			else
			    				values.push("0,0,0,0)");
			    		}
			    	}
		    	}
		    }
		    var joinedArray = values.join();
	    	db.run("INSERT INTO SG4 VALUES "+joinedArray);
	    }

/*MUSIC*/
	    function createMusicTable() {
	    	db.run("CREATE TABLE MUSIC (x,y,z,r,g,b,a);");
	    	var joinedData = emptyData.join();
	    	db.run("INSERT INTO MUSIC VALUES "+joinedData);
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


/*VIDEO*/
	    function createVideoTable() {
	    	db.run("CREATE TABLE VIDEO (x,y,z,r,g,b,a);");
	    	var joinedData = emptyData.join();
	   		db.run("INSERT INTO VIDEO VALUES "+joinedData);
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
		{
			console.log("updateVideo3D");
			if($("#useVideo").prop( "checked" ))
			{
			    var c = document.getElementById('videoCanvas');
			    var v = document.getElementById('camFeed');
			    c.getContext('2d').drawImage(v, 0, 0, Nx, Ny);
			    var data = c.getContext('2d').getImageData(0, 0, Nx, Ny).data;
			    var values = [];
			    db.run("DELETE FROM VIDEO");
			    for(var x=0; x<Nx; x++)
			    {
			    	for(var y=0; y<Ny; y++)
			    	{
			    		for(var z=0; z<Nz; z++)
			    		{
					    	var s = (y*Nx+x)*4;
				    		var vz = getVideoZ(data[s], data[s+1], data[s+2]);
				    		values.push("("+x+","+y+","+z);
				    		if(vz == z)
				    		{
				    			values.push(data[s]);
				    			values.push(data[s+1]);
				    			values.push(data[s+2]+",255)");
				    		}
				    		else
				    		{
				    			values.push("0,0,0,0)");
				    		}
			    		}
			    	}
			    }
			    var joinedArray = values.join();
			    db.run("INSERT INTO VIDEO VALUES "+joinedArray);
			}
			else{
				db.run("UPDATE VIDEO SET r=?, g=?, b=?, a=?",[clearColor[0],clearColor[1],clearColor[2],clearColor[3]]);
			}
		}

		function getVideoZ(r,g,b)
		{
			return Math.round((r+g+b)/765.*(Nz-1));
		}

/*EXECUTE*/
	    function execute()
	    {
			var statement = $("#queryText").val();

			clearIntervals();

			if(statement.indexOf("MUSIC") > -1) //selects from Music table
			{
				if(musicIntervalID == 0)
					musicIntervalID = window.setInterval(function() {updateMusicTable(); }, 100);
			}
			if(statement.indexOf("VIDEO")> -1) //selects from Video table
			{
				if(videoIntervalID == 0)
					videoIntervalID = window.setInterval(function() {updateVideoTable(); }, 100);
			}
			/*if(statement.indexOf("MOVE")>-1) //selects from MOVE table
			{
				moveIntervalID = window.setInterval(function() {updateMoveTable(); }, 100);
			}*/
			if(intervalSet())
			{
				queryIntervalID = window.setInterval(function() {query(statement); }, 100);
			}
			else
			{
				query(statement);
			}
	    }

		function query(statement) 
		{
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
				showResult(result);
			}
			else
			{
				alert("Empty result");
				clearIntervals();
			}
	  	}

 		var dataArray; //data for color texture
	  	function showResult(result)
	  	{
	  		var a_ = -1;
	  		//check if given result is of needed format
	  		if(!("x" in result[0]))
	  		{
	  			alert("no x value selected");
	  			return;
	  		}
	  		if(!("y" in result[0]))
	  		{
	  			alert("no y value selected");
	  			return;
	  		}
	  		if(!("z" in result[0]))
	  		{
	  			alert("no y value selected");
	  			return;
	  		}
	  		if(!("r" in result[0]))
	  		{
	  			alert("no r value selected");
	  			return;
	  		}
	  		if(!("g" in result[0]))
	  		{
	  			alert("no g value selected");
	  			return;
	  		}
	  		if(!("b" in result[0]))
	  		{
	  			alert("no b value selected");
	  			return;
	  		}
	  		if(!("a" in result[0]))
	  			a_ = 255;

	  		//fill color texture Array
	  		//TODO: delete data array
	  		for(var i=0; i<result.length; i++)
	  		{
	  			var r = clamp(Math.round(result[i].r), 0, 255);
	  			var g = clamp(Math.round(result[i].g), 0, 255);
	  			var b = clamp(Math.round(result[i].b), 0, 255);
	  			var a = 0;
	  			if(a_ != -1)
	  				a = a_;
	  			else
	  				a = clamp(result[i].a,0,255);

	  			var x = Math.round(result[i].x);
	  			var y = Math.round(result[i].y);
	  			var z = Math.round(result[i].z);

	  			var s = z*Ny*Nx + y*Nx + x;
	  			s *= 4; //4 values per entry
	  			dataArray[s] = r;
	  			dataArray[s+1] = g;
	  			dataArray[s+2] = b;
	  			dataArray[s+3] = a;

	  			//console.log("dataArray["+x+","+y+","+z+"("+s+")] = ("+r+","+g+","+b+","+a+")");
	  		}

		  	function clamp(val, min, max)
		  	{
				return Math.min(Math.max(val, min), max);
		  	}
	  	}

/*INIT GL STUFF*/
	    var gl;
	    function initGL(canvas) 
	    {
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

	    function getShader(gl, id) 
	    {
	        var shaderScript = document.getElementById(id);

	        if (!shaderScript) {
	            return null;
	        }

	        var str = "";
	        var k = shaderScript.firstChild;
	        while (k) {
	            if (k.nodeType == 3) {
	                str += k.textContent;
	            }
	            k = k.nextSibling;
	        }

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

	    function initShaders() 
	    {
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

	        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	        shaderProgram.mvMatrixInverseUniform = gl.getUniformLocation(shaderProgram, "uMVMatrixInverse");
	        shaderProgram.Nx = gl.getUniformLocation(shaderProgram, "Nx");
	        shaderProgram.Ny = gl.getUniformLocation(shaderProgram, "Ny");
	        shaderProgram.Nz = gl.getUniformLocation(shaderProgram, "Nz");
	        shaderProgram.viewport = gl.getUniformLocation(shaderProgram, "viewport");
	        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	        shaderProgram.texWidth = gl.getUniformLocation(shaderProgram, "texWidth");
	    }

	    function setUniforms() 
	    {
	        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	        gl.uniformMatrix4fv(shaderProgram.mvMatrixInverseUniform, false, mat4.inverse(mvMatrix));
	        gl.uniform2f(shaderProgram.viewport, drawDingsie[0], drawDingsie[1]);
	        gl.uniform1i(shaderProgram.Nx, Nx);
	        gl.uniform1i(shaderProgram.Ny, Ny);
	        gl.uniform1i(shaderProgram.Nz, Nz);
	        gl.uniform1i(shaderProgram.texWidth, texWidth);
	    }

	    var triangleVertexPositionBuffer;
	    var squareVertexPositionBuffer;

	    function initBuffers() 
	    {
	        squareVertexPositionBuffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	        var vertices = [
	             1.0,  1.0,  0.0,
	            -1.0,  1.0,  0.0,
	             1.0, -1.0,  0.0,
	            -1.0, -1.0,  0.0
	        ];
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	        squareVertexPositionBuffer.itemSize = 3;
	        squareVertexPositionBuffer.numItems = 4;
	    }


	    var colorTex;
	    function drawScene() 
	    {
	        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	        gl.bindTexture(gl.TEXTURE_2D, colorTex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataArray);
//			gl.bindTexture(gl.TEXTURE_2D, null);

	        gl.activeTexture(gl.TEXTURE0);
//        	gl.bindTexture(gl.TEXTURE_2D, colorTex);
        	gl.uniform1i(shaderProgram.samplerUniform, 0);

		    mat4.identity(mvMatrix);
		    mat4.multiply(mvMatrix, rotMat);

	        setUniforms();
	        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	    }

	    var stopRendering;
	  	function tick() 
	  	{
	  		if(!stopRendering)
	  		{
	    		requestAnimationFrame(tick);
	    		drawScene();
	  		}
	  	}

	    function initTexture() 
	    {
	        colorTex = gl.createTexture();
	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	        gl.bindTexture(gl.TEXTURE_2D, colorTex);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	        gl.bindTexture(gl.TEXTURE_2D, null);
	    }

	    function init() 
	    {
console.log("3Dinit");
			activeDim = 3;
			stopRendering = false;

	    	if(Nx*Ny*Nz > texWidth)
	    		alert('insufficient Texture width!');

	    	drawDingsie = new Float32Array([$(window).width(), $(window).height()]);
	    	//create canvas to draw in
	    	$('#container').append("<canvas class='drawCanvas' id='drawCanvas' style='border: none;' width='"+drawDingsie[0]+"' height='"+drawDingsie[1]+"'></canvas>")
		    var canvas = document.getElementById('drawCanvas');
			dataArray = new Uint8Array(texWidth*4);
			for (var i = 0 ; i<texWidth; i++)
			{
				dataArray[4*i] = 0;
				dataArray[4*i+1] = 0;
				dataArray[4*i+2] = 0;
				dataArray[4*i+3] = 255;
			}

		    initGL(canvas);
		    initShaders();
		    initBuffers();
		    initTexture();

		    gl.clearColor(0.0, 0.0, 0.0, 0.0);
		    gl.enable(gl.DEPTH_TEST);

		    canvas.onmousedown = handleMouseDown;
		    document.onmouseup = handleMouseUp;
		    document.onmousemove = handleMouseMove;

			db = new SQL.Database();

	  		//Init Music
		    initSoundAnalyzer(); 
		    loadSound(musicPath);

		    //Init Video
	  		if(video)
	  			initVideo(Ny, Nx);
	  		else
	  			alert("Your browser does not support GetUserMedia()");

	  		createEmptyData();
			createDefaultTable();
			createMusicTable();
			createVideoTable();

		    tick();
		    //drawScene();
	  	}

	    function cleanup()
	    {
	    	db.run("DROP TABLE SG4");
	    	db.run("DROP TABLE VIDEO;");
	    	db.run("DROP TABLE MUSIC;");
	    	db = null;
	    	gl.deleteTexture(colorTex);
	    	gl.deleteBuffer(squareVertexPositionBuffer);
	    	$('#container *').remove();

	    	mat4.identity(mvMatrix);
	    	mat4.identity(rotMat);

	    	dataArray = [];
	    	emptyData = [];
	    	drawDingsie = [];
	    	prevData = [];

	    	stopRendering = true;
	    	activeDim = 0;
	    }

	  	return {
	  		init : function() {init();},
	  		execute : function() {execute();},
	  		cleanup : function() {cleanup();},
	  		toggleVideo : function() {toggleVideo();},
	  		toggleMusic : function() {toggleMusic();}
	  	};
})();