'use strict'; /* globals $ dat OrbitControls */
var ThreeD = (function() {

	    var error = "";
	    var emptyData = [];
	    var parsedSelect;
	    var clearColor = [255,255,255,0.25];
	    var musicColor = [255,0,0,1];
	    var moveColor = [255,142,0,1];

	    var rows = 3;
		var cols = 3;
		var peter = 3;
		var texWidth = 32;

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

		var mouseControl;
		var uRayOrigin;
		var uRayTarget;

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
		    mat4.rotate(newRot, degToRad(deltaX / 10), [0, 1, 0]);

		    var deltaY = newY - lastMouseY;
		    mat4.rotate(newRot, degToRad(deltaY / 10), [1, 0, 0]);

		    mat4.multiply(newRot, rotMat, rotMat);

		    lastMouseX = newX
		    lastMouseY = newY;
		}

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
			    			//values.push(z/parseFloat(peter)*255+", 20, 100, 1)");
			    			values.push("255, 20, 10, 1)");
			    		}
			    		else
			    		{
			    			values.push("0,50,200,0.5)");
			    		}
			    	}
		    	}
		    }
	    	db.run("INSERT INTO dummy VALUES "+values.join());
	    	//console.log(values.join());

	    	//db.run("INSERT INTO dummy VALUES (0,0,0,255,0,0,1)");
	    }

	    function execute(){
			var statement = $("#queryText").val();

			/*clearIntervals();

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
			{*/
				query(statement);
			//}
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
	  			a_ = 1;

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
	  				a = clamp(result[i].a,0,1);

	  			var x = Math.round(result[i].x);
	  			var y = Math.round(result[i].y);
	  			var z = Math.round(result[i].z);

	  			var s = z*rows*cols + y*cols + x;
	  			s *= 4; //4 values per entry
	  			dataArray[s] = r;
	  			dataArray[s+1] = g;
	  			dataArray[s+2] = b;
	  			dataArray[s+3] = a*255;

	  		}

		  	function clamp(val, min, max)
		  	{
				return Math.min(Math.max(val, min), max);
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

	        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	        shaderProgram.mvMatrixInverseUniform = gl.getUniformLocation(shaderProgram, "uMVMatrixInverse");
	        shaderProgram.Nx = gl.getUniformLocation(shaderProgram, "Nx");
	        shaderProgram.Ny = gl.getUniformLocation(shaderProgram, "Ny");
	        shaderProgram.Nz = gl.getUniformLocation(shaderProgram, "Nz");
	        shaderProgram.viewport = gl.getUniformLocation(shaderProgram, "viewport");
	        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	        shaderProgram.texWidth = gl.getUniformLocation(shaderProgram, "texWidth");
	    }

	    function setUniforms() {
	        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	        gl.uniformMatrix4fv(shaderProgram.mvMatrixInverseUniform, false, mat4.inverse(mvMatrix));
	        gl.uniform2f(shaderProgram.viewport, drawDingsie[0], drawDingsie[1]);
	        gl.uniform1i(shaderProgram.Nx, cols);
	        gl.uniform1i(shaderProgram.Ny, rows);
	        gl.uniform1i(shaderProgram.Nz, peter);
	        gl.uniform1i(shaderProgram.texWidth, texWidth);
	    }

	    var triangleVertexPositionBuffer;
	    var squareVertexPositionBuffer;

	    function initBuffers() {
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
	    function drawScene() {
	        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	        gl.bindTexture(gl.TEXTURE_2D, colorTex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataArray);
			gl.bindTexture(gl.TEXTURE_2D, null);

	        gl.activeTexture(gl.TEXTURE0);
        	gl.bindTexture(gl.TEXTURE_2D, colorTex);
        	gl.uniform1i(shaderProgram.samplerUniform, 0);

		    mat4.identity(mvMatrix);
		    mat4.multiply(mvMatrix, rotMat);

	        setUniforms();
	        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	    }

	  	function tick() {
	    	requestAnimationFrame(tick);
	    	drawScene();
	  	}

	    function initTexture() {
	        colorTex = gl.createTexture();
	        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	        gl.bindTexture(gl.TEXTURE_2D, colorTex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataArray);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	        gl.generateMipmap(gl.TEXTURE_2D);
	        gl.bindTexture(gl.TEXTURE_2D, null);
	    }

	    function init() {

	    	drawDingsie = new Float32Array([$(window).width(), $(window).height()]);
	    	//create canvas to draw in
	    	$('#container').append("<canvas class='drawCanvas' id='drawCanvas' style='border: none;' width='"+drawDingsie[0]+"' height='"+drawDingsie[1]+"'></canvas>")
		    var canvas = document.getElementById('drawCanvas');
			dataArray = new Uint8Array(texWidth*4);

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
			createDefaultTable();

		    tick();
		    //drawScene();
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