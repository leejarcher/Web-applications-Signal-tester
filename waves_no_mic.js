
// MAIN PROGRAM CALLED WHEN AUDIO DATA LOADED
// WAVEFORMS SCREEN

function finishedLoading(bufferList) {

	var customWave = [],
		analyserWin = ""; // the analyser window object
	
	locationbar = false;
	
	// microphone selection initially off and not setup
	mic = false,
	micSetUp = false;
		
	// connect master output and set gain
	master = context.createGain();
	master.connect(context.destination);
	master.gain.value = OUTPUT;
		
	// setup oscillators, WAVs and gains
	for (var i = 0;i < 2;i++) {		
	
		// setup gains
		gain[i] = context.createGain();
		//gain[i].connect(master); // MIX connect both osc. to output
		gain[i].connect(master); // connect gain to master output for MIX
		gain[i].gain.value = OUTPUT;
		
		// setup oscillators
		oscillator[i] = context.createOscillator();
		oscillator[i].frequency.value = FREQUENCY;
		oscillator[i].type = "sine";
		oscillator[i].start(0);
		
		// setup white noise WAVs
		oscillator[i + 2] = context.createBufferSource();
		oscillator[i + 2].buffer = bufferList[i];
		oscillator[i + 2].loop = true;// set arbitrary WAV to loop
		oscillator[i + 2].start(0);
		
		// setup pink noise WAVs
		oscillator[i + 4] = context.createBufferSource();
		oscillator[i + 4].buffer = bufferList[i + 2];
		oscillator[i + 4].loop = true;// set arbitrary WAV to loop
		oscillator[i + 4].start(0);
		
		// setup WAVs
		oscillator[i + 6] = context.createBufferSource();
		oscillator[i + 6].buffer = bufferList[i + 4];
		oscillator[i + 6].loop = true;// set arbitrary WAV to loop
		oscillator[i + 6].start(0);
		
		/* setup MIC oscillator 9 
		only when selected */
		
		/* add onoff, wavechange, frequency
		and output event listeners */
		var onOff = document.getElementById("onButton" + i),
			wave = document.getElementById("waveforms" + i),
			fChange = document.getElementById("freq" + i),
			oChange = document.getElementById("out" + i);
		onOff.addEventListener("click", onOffButton, false);
		wave.addEventListener ("click", waveChange, false);
		fChange.addEventListener("change", freqChange, false);
		oChange.addEventListener("change", outChange, false);
	}
	
	// add analyser switch event listener
	
	var analyser = document.getElementById("analyser");
	analyser.addEventListener("click", analyserButton, false);

	// SETUP CUSTOM WAVES	
	
	// custom0
	ajax("sounds/real0.csv", function(data) {
		
		// convert csv string to array data
		var real = [];
		real = data.split(",");
			
		// and imaginary values
		ajax("sounds/imag0.csv", function(data) {
			
				// convert csv string to array data
				var imag = [];
				imag = data.split(",");
		
				// finally create and set waveform
				customWave[0] = context.createPeriodicWave(real, imag);
				oscillator[0].setPeriodicWave(customWave[i]);
		});
	});
	
	// custom1
	ajax("sounds/real1.csv", function(data) {
		
		// convert csv string to array data
		var real = [];
		real = data.split(",");
			
		// and imaginary values
		ajax("sounds/imag1.csv", function(data) {
			
				// convert csv string to array data
				var imag = [];
				imag = data.split(",");
		
				// finally create and set waveform
				customWave[1] = context.createPeriodicWave(real, imag);
				oscillator[1].setPeriodicWave(customWave[i]);
		});
	});
	
	// add mix mod selection event listener
	var mChange = document.getElementById("mixMod");
	mChange.addEventListener("click", modChange, false);

	// ON OFF BUTTON FUNCTIONALITY
	function onOffButton() {
		var n = this.getAttribute("name"), // get name
			v = Number(n.charAt(n.length - 1)), // and find number
			button = document.getElementById("onButton" + v); // get button element
			
		if (on[v]) {
			oscillator[v + wav[v]].disconnect(gain[v]);
			on[v] = false;
			button.innerText = "Off"; // change button text
		}
		else {
			oscillator[v + wav[v]].connect(gain[v]);
			on[v] = true;
			button.innerText = "On"; // change button text
		}
	}

	// WAVEFORM SELECT FUNCTIONALITY
	function waveChange() {
		var n = this.getAttribute("name"), // get name
			v = Number(n.charAt(n.length - 1)), // and find number
			waves = document.getElementsByName("wave" + v);
		for (var i = 0; i < waves.length; i++) {
			if (waves[i].checked) {
				if (i >= 5) { selectWav(v,i);}
				else { selectOsc(v,waves[i]);}
			}
		}
	}
	
	// disconnect oscillator and connect WAV
	function selectWav(v,i) {
		var offSet = 2 * (i - 4), // get oscillator number offset
			frequency = document.getElementById("freq" + v).value; // get current frequency value
	
		//set playback rate
		oscillator[v + offSet].playbackRate.value = frequency / ADJWAV;
		
		if (on[v]) {
			oscillator[v + wav[v]].disconnect(gain[v]); // disconnect last oscillator
			oscillator[v + offSet].connect(gain[v]); // connect new WAV oscillator
		}
		
		// setup FM
		if (mix == 2 && !v) {
			
			// disconnect old osc frequency or playback rate
			if (!wav[0]) {
				gain[1].disconnect(oscillator[0].frequency);
			}
			else {
				gain[1].disconnect(oscillator[wav[0]].playbackRate);
			}
			
			// and connect new WAV playback rate instead
			gain[1].connect(oscillator[offSet].playbackRate);
		}
		wav[v] = offSet; // store new offset
	}
	
	// disconnect WAV and connect oscillator
	function selectOsc(v,waves) {
		
		//set frequency
		oscillator[v].frequency.value = document.getElementById("freq" + v).value;
		
		// and waveform
		if (waves.value == "custom") {
			oscillator[v].setPeriodicWave(customWave[v]);
		}
		else {
			oscillator[v].type = waves.value;
		}
		
		if (on[v]) {
			oscillator[v + wav[v]].disconnect(gain[v]);
			oscillator[v].connect(gain[v]);
		}
		
		// setup FM
		if (mix == 2 && !v && wav[0]) {
			
			// disconnect WAV playback rate
			gain[1].disconnect(oscillator[wav[0]].playbackRate);
			
			// and connect osc frequency instead
			gain[1].connect(oscillator[0].frequency);
		}	
		wav[v] = 0;
	}
	
	// FREQUENCY CHANGE FUNCTIONALITY
	function freqChange() {
		var n = this.getAttribute("name"); // get name
			v = Number(n.charAt(n.length - 1)); // and find number
			frequency = document.getElementById(n).value;
	
		// check limits and return to max or min if exceeded
		if (frequency > MAXFREQUENCY || frequency < MINFREQUENCY) {
			frequency = frequency > MAXFREQUENCY ? MAXFREQUENCY : MINFREQUENCY;
			document.getElementById(n).value = frequency;
		}
			
		// WAV playback rate adjust
		if (wav[v]) {
			oscillator[v + wav[v]].playbackRate.value = frequency / ADJWAV;
		}
		else {
			oscillator[v].frequency.value = frequency;
		}
	}

	// OUTPUT LEVEL CHANGE FUNCTIONALITY
	function outChange() {
		var n = this.getAttribute("name"), // get name
			v = Number(n.charAt(n.length - 1)), // and find number
			output = document.getElementById(n).value;
	
		// if max output exceeded return to max for both positive and negative
		if (output > MAXOUTPUT || output < -(MAXOUTPUT)) {
      		output = output > MAXOUTPUT ? MAXOUTPUT : -(MAXOUTPUT);
	  		document.getElementById(n).value = output;
		}
		
		// if FM modulator multiply output by ADJFM
		if (mix == 2 && v == 1) { 
			output *= ADJFM;
		}
		gain[v].gain.value = output;
	}

	// MIX MOD CHANGE FUNCTIONALITY
	function modChange() {
		var mod = document.getElementsByName("mType");
		for (var i = 0; i < mod.length; i++) {
			if (mod[i].checked) {
				switch (i) {
				
				 	// MIX connect osc1 to output
					case 0:
						if (mix == 0) {break;} // already selected
						
						// disconnect previous gain1 connection
						if (mix == 1) {
							gain[1].disconnect(gain[0].gain);
						}
						else if (mix == 2) {
							
						// set level back to normal
							gain[1].gain.value = document.getElementById("out1").value;
							
							// disconnect WAV playbackrate or frequency
							if (wav[0]) {
								gain[1].disconnect(oscillator[wav[0]].playbackRate);
							}
							else {
								gain[1].disconnect(oscillator[0].frequency);
							}
						}	
					
						// and reconnect to audio output
						gain[1].connect(master);
					
						mix = 0;
						break;
				
					// AM connect osc1 to osc0 gain
					case 1:
						if (mix == 1) {break;} // already selected
						
						// disconnect previous gain1 connection
						if (mix == 0) { 
							gain[1].disconnect(master);
						}
						else if (mix == 2) {
							
							// set level back to normal
							gain[1].gain.value = document.getElementById("out1").value;
							
							// disconnect WAV playbackrate or frequency
							if (wav[0]) {
								gain[1].disconnect(oscillator[wav[0]].playbackRate);
							}
							else {
								gain[1].disconnect(oscillator[0].frequency);
							}
						}	
					
						// and reconnect to gain0 gain
						gain[1].connect(gain[0].gain);
					
						mix = 1;
						break;
				
					// FM connect osc1 to osc0 frequency
					case 2: 
						if (mix == 2) {break;} // already selected
						
						// disconnect previous gain1 connection
						if (mix == 0) {
							gain[1].disconnect(master);
						}
						else if (mix == 1) {
							gain[1].disconnect(gain[0].gain);
						}
				
						// and reconnect to osc0 frequency
						if (wav[0]) {
							gain[1].connect(oscillator[wav[0]].playbackRate);
						}
						else {
							gain[1].connect(oscillator[0].frequency);
						}
					
						// increase output by ADJFM
						gain[1].gain.value = document.getElementById("out1").value * ADJFM;
			
						mix = 2;
						break;
				
				 	// unspecified mod.
					default:
						alert("Error:Undefined modulation type");
				}
			}
		}
	}
	
	// ANALYSER SWITCH FUNCTIONALITY
	function analyserButton() {
		if (!analyserWin.opener) { // open analyser window if not already
			event.preventDefault(); // open in another tab/window
			analyserWin = window.open("analyser.html", "analyser");
		}
		analyserWin.focus(); // give the analyser window focus
	}
	
	// MIC SWITCH FUNCTIONALITY
	function micSelected() {
		
		// setup microphone input if not already
		if (!micSetUp) {
			micSetUp = true;
			navigator.getUserMedia({audio:true}, 
          	function(stream) {
              startMicrophone(stream);
          },
          function(e) {
            alert("Error capturing audio.");
          }
          );
		  return;
		}
		
		if (mic) setGenerator();
		else setMic();
	}
	
	function startMicrophone(stream){
      	microphoneStream = opener.context.createMediaStreamSource(stream);
		setMic();
	}
	
	function setMic() {
		mic = true;
		micButton.innerText = "Generator";
		
		// disconnect waveforms and connect mic
		
		//meter
		webAudioPeakMeter.disconnect(opener.master);
		webAudioPeakMeter.connect(microphoneStream);
		
		//oscilloscope
		opener.master.disconnect(scope);
		microphoneStream.connect(scope);
		
		//spectrum analyser
		opener.master.disconnect(spectrum);
		microphoneStream.connect(spectrum);
	}
	
	function setGenerator() {
		mic = false;
		micButton.innerText = "Microphone";
			
		// disconnect mic and connect waveforms
		
		//meter
		webAudioPeakMeter.disconnect(microphoneStream);
		webAudioPeakMeter.connect(opener.master);
		
		//oscilloscope
		microphoneStream.disconnect(scope);
		opener.master.connect(scope);
		
		//spectrum analyser
		microphoneStream.disconnect(spectrum);
		opener.master.connect(spectrum);
	}
}




