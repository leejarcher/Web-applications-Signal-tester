// ANALYSER SCREEN

// constants for canvas size
var WIDTH = 325,
	HEIGHT = 125;

onload = function () {
	
	// add waveforms switch event listener
	var waves = document.getElementById("waveforms");
	waves.addEventListener("click", waveformsButton, false);
	
	// PEAK LEVEL METERS
  	var myMeterElement = document.getElementById("my-peak-meter"),
  	  	meterNode = webAudioPeakMeter.createMeterNode(opener.master, opener.context);
  	webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
	
	// OSCILLOSCOPE
	var scope = opener.context.createAnalyser(); // create analyser
	opener.master.connect(scope); // and connect to master output
	var scopeBuffLength = scope.frequencyBinCount,
		scopeArray = new Uint8Array(scopeBuffLength), // setup data array
	
	// setup and clear the canvas
		c = document.getElementById("scope"),
		scopeCtx = c.getContext("2d");
	scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);

	// draw scope waveform function
	function scopeDraw () {
		drawVisual = requestAnimationFrame(scopeDraw);
		scope.getByteTimeDomainData(scopeArray);
		
		// fill canvas with solid colour
		scopeCtx.fillStyle = "rgb(200, 200, 200)";
      	scopeCtx.fillRect(0, 0, WIDTH, HEIGHT);
		
		// draw graticule
		
		// centre line
		scopeCtx.lineWidth = 1;
		scopeCtx.strokeStyle = "grey";
		scopeCtx.beginPath();
		scopeCtx.moveTo(0, HEIGHT / 2);
		scopeCtx.lineTo(WIDTH, HEIGHT / 2);
		
		// main grid
		for (var x = 0; x <= WIDTH; x += 25) {
			for (var y = 0; y <= HEIGHT; y += 25) {
				scopeCtx.moveTo(x, y);
				scopeCtx.lineTo(x, HEIGHT);
				scopeCtx.moveTo(x, y);
				scopeCtx.lineTo(WIDTH, y);
			}
		}
		scopeCtx.closePath();
		scopeCtx.stroke();
		
		// select colour, width and start drawing wave
		scopeCtx.lineWidth = 2;
      	scopeCtx.strokeStyle = "rgb(0, 0, 0)";
      	scopeCtx.beginPath();
		
		var sliceWidth = WIDTH * 1.0 / scopeBuffLength,
      		x = 0; // determine width of each segment of line
		
		// line drawing loop
		for (var i = 0; i < scopeBuffLength; i++) {
        	var v = scopeArray[i] / 128.0,
        		y = v * HEIGHT / 2;
        	if (i === 0) {
          	scopeCtx.moveTo(x, y);
        	} else {
          	scopeCtx.lineTo(x, y);
        	}
        	x += sliceWidth;
		
      	}
      	scopeCtx.stroke(); // finish line
	}
	scopeDraw(); // start drawing the scope waveform
	
	// WAVEFORMS SWITCH FUNCTIONALITY
	function waveformsButton() {
		var waveformsWin = window.open("", "waveSelect"); // open the waveforms selection window
		waveformsWin.parent.focus(); // give focus to waveforms window
	}

};

