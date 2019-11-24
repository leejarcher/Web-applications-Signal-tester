
// MAIN PROGRAM CALLED WHEN AUDIO DATA LOADED
// WAVEFORMS SCREEN

function finishedLoading(bufferList) {

	var customWave = [],
		analyserWin = "", // the analyser window object
		modType = 0, // current modulation selected, initially mix
		offSet = 0, // oscillator/wav offset
		v = 0; // oscillator selected to change
		
	// microphone initially not setup
	var micSetUp = false;
		
	// connect master output and set gain
	master = context.createGain();
	master.connect(context.destination);
	master.gain.value = OUTPUT;
	
	/* setup suppressed carrier gain node.
	   The gain is the same as oscillator 0
	   but 180 deg out of phase to cause 
	   cancellation. */  
	scGain = context.createGain();
	scGain.gain.value = 0; // initial gain 0 so no carrier suppression
	scGain.connect(master);
	
	/* setup suppressed modulator gain node.
	   The gain is the same as oscillator 1
	   but 180 deg out of phase to cause 
	   cancellation. */ 
	smGain = context.createGain();
	smGain.gain.value = 0; // initial gain 0 so no modulator suppression
	smGain.connect(master);
		
	// setup oscillators, WAVs and gains
	for (var i = 0; i < 2; i++) {		
	
		// setup gains
		gain[i] = context.createGain();
		gain[i].connect(master); // connect gain to master output for MIX
		gain[i].gain.value = OUTPUT;
		
		// setup oscillators
		oscillator[i] = context.createOscillator();
		oscillator[i].frequency.value = FREQUENCY;
		oscillator[i].type = "sine";
		if (!i) {
			oscillator[0].connect(scGain); // suppressed carrier node
		}
		else { 
			oscillator[1].connect(smGain); // suppressed modulator node
		}
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
		
		/* setup microphone stream
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
	
	// add analyser switch event listeners
	var analyser1 = document.getElementById("analyser1"),
		analyser2 = document.getElementById("analyser2");
	analyser1.addEventListener("click", analyserButton, false);
	analyser2.addEventListener("click", analyserButton, false);

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
		
		// oscillator on/off
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
		
		// update suppression
		suppress();
	}

	// WAVEFORM SELECT FUNCTIONALITY
	function waveChange() {
		var n = this.getAttribute("name"); // get name
		v = Number(n.charAt(n.length - 1)); // and find number
		var waves = document.getElementsByName("wave" + v);

		for (var i = 0; i < waves.length; i++) {
			if (waves[i].checked) {
				offSet = 2 * (i - 4); // get oscillator number offset
				
				if (i == 8) {
					selectMic();
				}
				else if (i >= 5) {
					suppressWav();
					selectWav(v,i);
				}
				else {
					suppressOsc();
					selectOsc(v,waves[i]);
				}
			}
		}
		
		/* disconnect WAV suppression 
		and connect oscillator suppression */
		function suppressOsc() {
			
			/* if oscillator[0] selected disconnect carrier suppression 
		   wav[0] and connect oscillator[0] */
			if (!v) {
				oscillator[0 + wav[0]].disconnect(scGain);
				oscillator[0].connect(scGain);
			}
		
			/* otherwise disconnect modulation suppression
		   	wav[1] and connect oscillator[1] */
			else {
				oscillator[1 + wav[1]].disconnect(smGain);
				oscillator[1].connect(smGain);
			}
		}
	}
	
	/* disconnect oscillator suppression 
		and connect WAV suppression */
	function suppressWav() {
	
		/* if oscillator[0] selected disconnect carrier suppression 
		oscillator[0] and connect wav[0] */
		if (!v) {
			oscillator[0 + wav[0]].disconnect(scGain);
			oscillator[0 + offSet].connect(scGain);
		}

		/* otherwise disconnect modulation suppression
		oscillator[1] and connect wav[1] */
		else {
			oscillator[1 + wav[1]].disconnect(smGain);
			oscillator[1 + offSet].connect(smGain);
		}
	}
	
	// disconnect oscillator and connect WAV
	function selectWav(v,i) {
			frequency = document.getElementById("freq" + v).value; // get current frequency value
			
		// set playback rate
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
		
		// set frequency
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
	
	// disconnect oscillator or WAV and connect mic
	function selectMic() {
		
		// check if mic has been setup
		if (!micSetUp) setUpMic();
		else connectMic();
		
		// ask for permission to use mic etc.
		function setUpMic() {
			
			navigator.mediaDevices.getUserMedia({audio:true,
			groupId:audiooutput},
        	function(stream) {
        		startMicrophone(stream);
        	},
        	function(e) {
        		alert("Error capturing audio.");
        	}
        	);
			
			return;
			
			function startMicrophone(stream){
      			oscillator[9] = context.createMediaStreamSource(stream);
				connectMic();
				micSetUp = true;
			}
		}
		
		function connectMic() {
				
			/* if oscillator on disconnect last 
			oscillator and connect mic stream */
			if (on[1]) {
				oscillator[1 + wav[1]].disconnect(gain[1]);
				oscillator[9].connect(gain[1]);
			}
			
			// setup mic suppression using wav suppression
			suppressWav();
			
			wav[1] = 8; // save the mic stream as last oscillator
		}
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
				modType = i; // save modulation type

				switch (i) {
				
				 	// MIX connect osc1 to output
					case 0:
						if (mix == 0) {break;} // already selected
						
						// disconnect previous gain1 connection
						if (mix != 2) {
							gain[1].disconnect(gain[0].gain);
						}
						else {
							
							// set level back to normal
							gain[1].gain.value = document.getElementById("out1").value;
							
							// reconnect gain1 to master
							gain[1].connect(master);
							
							// disconnect WAV playbackrate or frequency
							if (wav[0]) {
								gain[1].disconnect(oscillator[wav[0]].playbackRate);
							}
							else {
								gain[1].disconnect(oscillator[0].frequency);
							}
						}	
						mix = 0;
						break;
				
					// AM connect osc1 to osc0 gain
					case 1:
					case 3:
					case 4:
						if (mix == i) {break;} // already selected
						if (mix == 2) {
							
							// set level back to normal
							gain[1].gain.value = document.getElementById("out1").value;
							
							// reconnect gain1 to master
							gain[1].connect(master);
							
							// disconnect WAV playbackrate or frequency
							if (wav[0]) {
								gain[1].disconnect(oscillator[wav[0]].playbackRate);
							}
							else {
								gain[1].disconnect(oscillator[0].frequency);
							}
						}
						gain[1].connect(gain[0].gain);
					
						mix = i;
						break;
				
					// FM connect osc1 to osc0 frequency
					case 2:
						if (mix == 2) {break;} // already selected
						
						// disconnect previous gain1 connection
						gain[1].disconnect(master);
						
						if (mix != 0) {
							gain[1].disconnect(gain[0].gain);
						}
				
						// connect gain1 to osc0 frequency
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
				suppress(); // update suppression
			}
		}	
	}
	
	/* SUPRESSED CARRIER FUNCTIONS */
		
	// suppress carrier
	function scOn() {
			scGain.gain.value = -(gain[0].gain.value);
	}
		
	// turn carrier on
	function scOff() {
			scGain.gain.value = 0;
	}
		
	/* SUPRESSED MODULATOR FUNCTIONS */
		
	// suppress modulator
	function smOn() {
			smGain.gain.value = -(gain[1].gain.value);
	}
		
	// turn modulator on
	function smOff() {
			smGain.gain.value = 0;
	}
	
	// decide whether to suppress/unsuppress carrier and modulator 
	function suppress() {
		
		// suppress unsuppress carrier
		if (modType > 2 && on[0]) {
			scOn();
		}
		else {
			scOff();
		}
				
		// suppress unsuppress modulator
		if (modType == 4 && on[1]) {
			smOn();
		}
		else {
			smOff();
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
	
}




