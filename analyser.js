// ANALYSER SCREEN
	
onload = function () {
	
	// constants for canvas size
	var WIDTH = 325,
		HEIGHT = 125;
	
	// add waveforms and reset event listeners
	var waves1 = document.getElementById("waveforms1"),
		waves2 = document.getElementById("waveforms2"),
		reset = document.getElementById("reset");
	waves1.addEventListener("click", waveformsButton, false);
	waves2.addEventListener("click", waveformsButton, false);
	reset.addEventListener("click", resetButton, false);
	
	// PEAK LEVEL METERS
  	var myMeterElement = document.getElementById("my-peak-meter"),
  	  	meterNode = webAudioPeakMeter.createMeterNode(opener.master, opener.context);
  	webAudioPeakMeter.createMeter(myMeterElement, meterNode, {});
	
	// OSCILLOSCOPE
	var scope = opener.context.createAnalyser(); // create analyser
	scope.fftSize = 4096;
	opener.master.connect(scope); // and connect to master output
	var scopeBuffLength = scope.frequencyBinCount,
		scopeArray = new Uint8Array(scopeBuffLength), // setup data array
	
	// setup and clear the canvas
		c = document.getElementById("scope"),
		scopeCtx = c.getContext("2d");
	scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);

	// determine width of each segment of line
	var sliceWidth = WIDTH * 2.0 / scopeBuffLength;
		
	// draw scope waveform function
	function scopeDraw () {
		drawVisual = requestAnimationFrame(scopeDraw);
		scope.getByteTimeDomainData(scopeArray);
		
		/* start with a no trigger condition
		until first two data bytes read */
		var lastByte = 0, 
			x = 0, // start trace on left
			triggered = false; // scope not triggered yet
			
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
		for (var xx = 0; xx <= WIDTH; xx += 25) {
			for (var yy = 0; yy <= HEIGHT; yy += 25) {
				scopeCtx.moveTo(xx, yy);
				scopeCtx.lineTo(xx, HEIGHT);
				scopeCtx.moveTo(xx, yy);
				scopeCtx.lineTo(WIDTH, yy);
			}
		}
		scopeCtx.closePath();
		scopeCtx.stroke();
		
		// select colour, width and start drawing wave
		scopeCtx.lineWidth = 2;
      	scopeCtx.strokeStyle = "rgb(0, 0, 0)";
      	scopeCtx.beginPath();
		
			/* line drawing loop
			Only use 90% of buffer data.
			Its made twice as long as needed
			to allow a suitable trigger point
			to be found before displaying 
			the waveform */
			for (var i = 0; i < scopeBuffLength * 0.9; i++) {
        		var v = scopeArray[i];
				if (!triggered && v < 128 && lastByte >= 128) { // trigger on + rising edge
					triggered = true;
				}
				lastByte = v; // store current data byte
				var w = v / 128.0,
        			y = w * HEIGHT / 2;
				if (triggered) {
        			if (i === 0) {
          				scopeCtx.moveTo(x, y);
        			} else {
          				scopeCtx.lineTo(x, y);
        			}
        			x += sliceWidth;
				}
      		}
      	scopeCtx.stroke();
	}
	scopeDraw(); // start drawing the scope waveform
	
	// SPECTRUM ANALYSER
	var spectrum = opener.context.createAnalyser(); // create analyser
	spectrum.fftSize = 8192; // 5.4Hz resolution
	opener.master.connect(spectrum); // and connect to master output
	var spectrumBuffLength = spectrum.frequencyBinCount,
		spectrumArray = new Uint8Array(spectrumBuffLength),
	
	// setup the analyser canvas
		c = document.getElementById("spectrum"),
		spectrumCtx = c.getContext("2d");
		
	/* frequency bin goes to 22050Hz
	   we only want to go to 20000Hz
	   so adjust appropriately.      */
	var spectrumCount = spectrum.frequencyBinCount * 0.907,
		
		// x axis values locations
		scaleX = [0, 15, 31, 47, 64, 80, 96, 112, 129, 145,
		160, 176, 193, 209, 225, 241, 258, 274, 290, 306, 320];
	
	// draw frequency spectrum function
	function spectrumDraw () {
		
		// add the scale
		spectrumCtx.clearRect(0, 0, WIDTH, HEIGHT); // clear the canvas
		spectrumCtx.font = "5px arial";
		for (var n = 0; n < 21; n++) {
			spectrumCtx.strokeText(n, scaleX[n], HEIGHT - 1);
	}
		drawVisual = requestAnimationFrame(spectrumDraw);
		spectrum.getByteFrequencyData(spectrumArray);
		for (var i = 0; i < spectrumCount; i++) {
			var value = spectrumArray[i],
				percent = value / 256,
				height = HEIGHT * percent,
				offset = HEIGHT - height - 8,
				barwidth = WIDTH / spectrumCount;
			spectrumCtx.fillStyle = "red";
			spectrumCtx.fillRect(i * barwidth, offset, barwidth, height);
		}
	}
	spectrumDraw(); // start drawing the frequency spectrum
	
	// WAVEFORMS SWITCH FUNCTIONALITY
	function waveformsButton() {
		var waveformsWin = window.open("", "waveSelect"); // open the waveforms selection window
		waveformsWin.parent.focus(); // give focus to waveforms window
	}
	
	// RESET SWITCH FUNCTIONALITY
	function resetButton() {
		webAudioPeakMeter.reset();
	}
	
};

