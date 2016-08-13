		var moveIntervalID  = 0;
		var queryIntervalID = 0;
		var musicIntervalID = 0;
		var videoIntervalID = 0;

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

	    function clearIntervals()
	    {
			if(musicIntervalID > 0) //an interval is active, stop it
			{
				clearInterval(musicIntervalID);
				musicIntervalID = 0;
			}
			if(videoIntervalID > 0) //an interval is active, stop it
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