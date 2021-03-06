'use strict';
var TwoD = (function() {
	    var emptyData = [];
	    var parsedSelect;
	    var clearColor = [255,255,255,0.25]; //0.15! Change in css TODO

		var rows = 45;
		var cols = 45;

	    var db;
		var prevData = []; //needed for motion detection

	    /*TABLE CREATION*/
	    function createEmptyData() {
		    for(var x=0; x<rows; x++)
		    {
		    	for(var y=0; y<cols; y++)
		    	{
		    		emptyData.push("("+x+","+y+","+clearColor[0]+","+clearColor[1]+","+clearColor[2]+","+clearColor[3]+")");
		    	}
		    }
	    }

	    function createDefaultTable() {
		    db.run("CREATE TABLE dummy (x,y,r,g,b,a);");
		    var values = [];
		    for(var x=0; x<rows; x++)
		    {
		    	for(var y=0; y<cols; y++)
		    	{
		    		values.push("("+x);
		    		values.push(y);
		    		if(x==y)
		    		{
		    			values.push("200, 20, 100, 1)");
		    		}
		    		else
		    		{
		    			values.push("0,50,200,0.5)");
		    		}
		    	}
		    }
	    	db.run("INSERT INTO dummy VALUES "+values.join());
	    }

	    function createMusicTable() {
	    	db.run("CREATE TABLE MUSIC (x,y,r,g,b,a);");
	    	db.run("INSERT INTO MUSIC VALUES "+emptyData.join());
	    }

	    function createVideoTable() {
	    	db.run("CREATE TABLE VIDEO (x,y,r,g,b,a);");
	   		db.run("INSERT INTO VIDEO VALUES "+emptyData.join());
	    }

	    function createMoveTable() {
	    	db.run("CREATE TABLE MOVE (x,y,r,g,b,a);");
	   		db.run("INSERT INTO MOVE VALUES "+emptyData.join());
	    }

	    function createImageTable() {
	    	db.run("CREATE TABLE CUBE (x,y,r,g,b,a);");
			var c = document.getElementById('imageCanvas');
			var v = document.getElementById('imgCube');
			c.getContext('2d').drawImage(v, 0, 0, cols, rows);
			var data = c.getContext('2d').getImageData(0, 0, cols, rows).data;
		    var values = [];
		    for(var x=0; x<cols; x++)
		    {
		    	for(var y=0; y<rows; y++)
		    	{
		    		var s = (y*cols+x)*4;
	    			values.push("("+x+","+y);
	    			values.push(data[s]);
	    			values.push(data[s+1]);
	    			values.push(data[s+2]);
	    			values.push(data[s+3]+")");
		    	}
		    }
		    db.run("INSERT INTO CUBE VALUES "+values.join());

			c.getContext('2d').clearRect(0,0,50,50);

		    db.run("CREATE TABLE EVOKE (x,y,r,g,b,a);");
			var v = document.getElementById('imgEvoke');
			c.getContext('2d').drawImage(v, 0, 0, cols, rows);
			data = c.getContext('2d').getImageData(0, 0, cols, rows).data;
		    values = [];
		    for(var x=0; x<cols; x++)
		    {
		    	for(var y=0; y<rows; y++)
		    	{
		    		var s = (y*cols+x)*4;
	    			values.push("("+x+","+y);
	    			values.push(data[s]);
	    			values.push(data[s+1]);
	    			values.push(data[s+2]);
	    			values.push(data[s+3]+")");
		    	}
		    }
		    db.run("INSERT INTO EVOKE VALUES "+values.join());

	    }

	    /*TABLE UPDATES*/
	    function updateMusicTable() {
	    	db.run("UPDATE MUSIC SET r=?, g=?, b=?, a=?",[0,0,0,0]);//[clearColor[0],clearColor[1],clearColor[2],clearColor[3]]);
	    	if(typeof soundBars !== 'undefined') //no music playing
	    	{
		    	var n = nSoundBars;
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
		    		var sbHeight = Math.floor(cursb/diffPerCell);
		    		db.run("UPDATE MUSIC SET r=?, g=?, b=?, a=? WHERE y>? AND x BETWEEN ? AND ?", [musicColor[0],musicColor[1],musicColor[2],musicColor[3],rows-sbHeight,sb*num,(sb+1)*num-1]);
		    	}
	    	}
	    }

	 	function toggleMusic() {
	 		console.log("toggle 2D Music");
	 		if($("#playMusic").prop( "checked" )) //start music
	 		{console.log("play");
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
		        			videoIntervalID = window.setInterval(function() {updateVideoTable();}, 100)
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
			    		var s = (y*cols+x)*4;
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
			console.log("Update move table");
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
				    		var s = (y*cols+x)*4;
				    		if(!comparePixel(data[s], data[s+1], data[s+2], prevData[s], prevData[s+1], prevData[s+2]))
				    		{
				    			values.push(moveColor[0]+","+moveColor[1]+","+moveColor[2]+","+moveColor[3]+")");
				    		}
				    		else
				    		{
				    			values.push("0,0,0,0)");
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
	    function execute(){
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
			if(statement.indexOf("MOVE")>-1) //selects from MOVE table
			{
				if(moveIntervalID == 0)
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
			var result = [];
			var stmt = db.prepare(statement);
			if(stmt)
			{
				while(stmt.step()) {
			        var row = stmt.getAsObject();
			        result.push(row);
			    }
			    stmt.free();
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

	  	function showResult(result)
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

	  		instantTransition(result);

	/*  		var transition = $('input[name="Transition"]:checked').val();
	  		switch(transition) {
			    case "in":
					instantTransition(result);
			        break;
			    case "del":
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
			        break;
			    default:
			        instantTransition(result);
			}*/
		  	
		  	function clamp(val, min, max)
		  	{
				return Math.min(Math.max(val, min), max);
		  	}

		  	function getCurColor(divID)
		  	{
		  		var strCol = $("#"+divID).css('background-color');
		  		var res = [];

		  		strCol = strCol.split(', ');
		  		if(strCol[0].substring(0,4) == "rgba")
		  		{
			  		res.push(parseInt(strCol[0].substring(5,8)));
			  		res.push(parseInt(strCol[1]));
			  		res.push(parseInt(strCol[2]));
			  		res.push(parseFloat(strCol[3].substring(0,strCol[3].length-1)));
		  		}
		  		else //only rgb given
		  		{
			  		res.push(parseInt(strCol[0].substring(4,7)));
			  		res.push(parseInt(strCol[1]));
			  		res.push(parseInt(strCol[2].substring(0,strCol[2].length-1)));
			  		res.push(1.);
		  		}

		  		return res;
		  	}

		  	function instantTransition(result)
		  	{
				$("#container").children().css({backgroundColor: "rgba(0,0,0,0)"});
		  		for(var i=0; i<result.length; i++)
		  		{
		  			var id = [Math.round(result[i].x), Math.round(result[i].y)];
		  			var a = 0;
		  			var divID = "cell"+id.join("-");
		  			/*if($("#"+divID).attr('data-clearcol') != 1)
		  			{
						var pc = getCurColor(divID);
						if(pc[3] > 0)
						{
							console.log("case 1");
				  			var r = clamp(Math.round((result[i].r + pc[0])/2.), 0, 255);
				  			var g = clamp(Math.round((result[i].g + pc[1])/2.), 0, 255);
				  			var b = clamp(Math.round((result[i].b + pc[2])/2.), 0, 255);
						}
						else
						{console.log("case 2");
			  				var r = clamp(Math.round(result[i].r), 0, 255);
				  			var g = clamp(Math.round(result[i].g), 0, 255);
				  			var b = clamp(Math.round(result[i].b), 0, 255);
						}
			  			if(a_ != -1)
			  				a = a_;
			  			else
			  				a = clamp((result[i].a + pc[3])/2.,0,1);	
		  			}
					else
					{console.log("case 3");*/
		  				var r = clamp(Math.round(result[i].r), 0, 255);
			  			var g = clamp(Math.round(result[i].g), 0, 255);
			  			var b = clamp(Math.round(result[i].b), 0, 255);
			  			if(a_ != -1)
			  				a = a_;
			  			else
			  				a = clamp(result[i].a,0,1);	

			  			//mark cell as written
			  			$("#"+divID).attr('data-clearcol', 0);
					//}

		  			$("#cell"+id.join("-")).css({backgroundColor: "rgba("+r+","+g+","+b+","+a+")"});
		  		}
		  	}
	  	}

	    // INITIALIZATION
	    function init() {

	    	activeDim = 2;
	    	nSoundBars = 25;

	  		db = new SQL.Database();

	  		//Init Music
		    //initSoundAnalyzer(); 
		    //DEBUGloadSound(musicPath);

		    //Init Video
	  		if(video)
	  			initVideo(rows, cols);
	  		else
	  			alert("Your browser does not support GetUserMedia()");

			var dimension = $('input[name="Dimension"]:checked').val();
			var margin_of_cells = [];

			function getMarginOfCells () {
				var cell = $('.cell');
				margin_of_cells[0] = parseInt(cell.css('margin-top'), 10);
				margin_of_cells[1] = parseInt(cell.css('margin-right'), 10);
				margin_of_cells[2] = parseInt(cell.css('margin-bottom'), 10);
				margin_of_cells[3] = parseInt(cell.css('margin-left'), 10);
			}

			// helper functions
			function getCellSize () {
				var viewport_height = $(window).height()
				var cell_size = 0
				var combined_vertical_margin_of_cells = margin_of_cells[0] + margin_of_cells[2]
				cell_size = Math.floor(viewport_height / rows - combined_vertical_margin_of_cells)
				return cell_size
			}

			// get pixel width of container based on number of columns
			function getContainerWidth () {
				var cell = $('.cell');
				var width_of_all_cells = cell.width() * cols;
				var combined_margin_left_of_cells = margin_of_cells[3] * cols;
				var container_width = width_of_all_cells + combined_margin_left_of_cells;
				return container_width
			}

			// get pixel offset to center container vertically
			function getVerticalContainerOffset (container_width) {
				var container_height = container_width // because it´s a square, d´oh!
				var viewport_height = $(window).height()
				var vertical_container_offset = Math.round((viewport_height - container_height) / 2)
				return vertical_container_offset
			}

			// build grid
			function buildGrid(rows, cols) {
				for (var i = 0; i < rows; i++) {
					for (var j = 0; j < cols; j++) {
						var id = [j, i]
						$('#container').append("<div class='cell' id=cell" + id.join('-') + ' data-clearcol="1"></div>')
					}
				}
			}

			buildGrid(rows, cols);
			getMarginOfCells();

			// set dimensions of all cells
			$('.cell').css(
				{
					'width': getCellSize() + 'px',
					'height': getCellSize() + 'px'
				}
			)
			// set container size and offset
			$('#container').css(
				{
					'width': getContainerWidth() + 'px',
					'margin-top': getVerticalContainerOffset(getContainerWidth()) + 'px'
				}
			)

	  		//create tables
	  		createEmptyData();
	  		createDefaultTable();
	  		createMusicTable();
	  		createVideoTable();
	  		createMoveTable();
	  		createImageTable();
	    }

	    function cleanup()
	    {
	    	clearIntervals();

	    	db.run("DROP TABLE dummy;");
	    	db.run("DROP TABLE VIDEO;");
	    	db.run("DROP TABLE MUSIC;");
	    	db.run("DROP TABLE MOVE;");
	    	db = null;

	    	$('#container *').remove();
	    	$('#container').css({'width': '100%'});

	    	emptyData = [];
			prevData = [];

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