// HEADER FOR WAVES.JS

// CONSTANTS AND VARIABLES
var MINFREQUENCY = 0.1,
 	MAXFREQUENCY = 20000,
	MAXOUTPUT = 10,
	
	// divide frequency by this for WAV
	// playback rate 1000=x1 500=x0.5 
	// 2000=x2 (double speed) etc
	ADJWAV = 1000, 
	
	ADJFM = 1000, // multiply gain by this for FM
	OUTPUT = 0.5, // output gain
	FREQUENCY = 1000, // 1KHz
	on = [false, false],
	mix = 0, // 0=MIX 1=AM 2=FM 3=DSB-SC AM 4=RING MOD.
	// 0=oscillator 2=white noise 4=pink noise 6=WAV 9=mic
	wav = [0, 0],
	
	// 0 and 1 oscillator bank 0 and 1
	// 2 and 3 white noise bank 0 and 1 
	// 4 and 5 pink noise 6 and 7 WAV
	// 9 mic
	oscillator = [],
	gain = [], // [wavebank no.]
	scGain, // carrier cancellation gain node
	smGain, // modulator cancellation gain node
	master; // master output

name = "waveSelect"; // main parent waveforms selection window

// SETUP BUFFERLOADER AND AUDIO CONTEXT
onload = init;
var context,
	bufferLoader;

AudioContext = AudioContext || webkit.AudioContext;
context = new AudioContext();

function init() {

	bufferLoader = new BufferLoader(context,
	["sounds/white.wav",
	"sounds/white.wav", 
	"sounds/pink.wav",
	"sounds/pink.wav", 
	"sounds/wav0.wav",
	"sounds/wav1.wav", ], finishedLoading);
	
	bufferLoader.load();
}

// AJAX OPEN FILE FUNCTION
function ajax(url, onSuccess, onError) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (this.readyState === 4) {

            // onSuccess
            if (this.status === 200 && typeof onSuccess == "function") {
                onSuccess(this.responseText);
            }

            // onError
            else if(typeof onError == "function") {
                onError();
            }
        }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
    return xmlHttp;
}
