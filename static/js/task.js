/*
* Requires:
*     psiturk.js
*     utils.js
*/

// const { default: Player } = require("video.js/dist/types/player");

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
// Assume these conditions are passed from the server and are stored in a variable
// var conditionA = condition === 'A'; // Example condition
// var conditionB = condition === 'B'; // Example condition

// All pages to be loaded
var pages = [
	"instructions/instruct-checks.html",
	"instructions/instruct-1.html",
	"instructions/instruct-ready.html",
	"exp.html",
	"stage.html",
	"postquestionnaire.html"
];

// Define global variables
// var correctAnswer = 0;
// var min_value = 0;
// var max_value = 0;

// Function to fetch the correct answer from a text file
// async function getCorrectAnswer(source, textFileName) {
    // try {
    //     const response = await fetch(source + textFileName);
    //     if (!response.ok) throw new Error('Network response was not ok');
    //     const text = await response.text();
    //     correctAnswer = parseFloat(text.trim());
    //     if (!isNaN(correctAnswer)) {
    //         min_value = correctAnswer * 0.8;
    //         max_value = correctAnswer * 1.2;
    //         console.log(`Correct Answer: ${correctAnswer}`);
    //         console.log(`Min value: ${min_value}, Max value: ${max_value}`);
    //     } else {
    //         console.error('Text file must contain a valid number.');
    //     }
    // } catch (error) {
    //     console.error('Error fetching the text file:', error);
    // }
// }

// In javascript, defining a function as `async` makes it return  a `Promise`
// that will "resolve" when the function completes. Below, `init` is assigned to be the
// *returned value* of immediately executing an anonymous async function.
// This is done by wrapping the async function in parentheses, and following the
// parentheses-wrapped function with `()`.
// Therefore, the code within the arrow function (the code within the curly brackets) immediately
// begins to execute when `init is defined. In the example, the `init` function only
// calls `psiTurk.preloadPages()` -- which, as of psiTurk 3, itself returns a Promise.
//
// The anonymous function is defined using javascript "arrow function" syntax.
const init = (async () => {
	await psiTurk.preloadPages(pages);
})()

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-checks.html",
	"instructions/instruct-1.html",
	"instructions/instruct-ready.html"
];

/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/********************
* Inattentional blindness task       *
********************/

const folderNames = ["Horizontal", "Vertical","Curves", "Lines"];

function changeToText() {
    var hiddenInput = document.getElementById('hiddenInput');
    if (!hiddenInput) return; // Exit if the input doesn't exist

    var value = hiddenInput.value || hiddenInput.placeholder;

    // Create a new span element
    var span = document.createElement('span');
    span.id = 'hiddenInput';
    span.textContent = value;
    span.style.cssText = hiddenInput.style.cssText;
    span.style.display = 'inline'; // or 'block', depending on your layout needs

    // Store the input's attributes for later use
    span.setAttribute('data-input-type', hiddenInput.type);
    span.setAttribute('data-input-name', hiddenInput.name);
    span.setAttribute('data-input-placeholder', hiddenInput.placeholder);

    // Replace the input with the span
    hiddenInput.parentNode.replaceChild(span, hiddenInput);
}

function changeToInput() {
    var span = document.getElementById('hiddenInput');
    if (!span) return; // Exit if the span doesn't exist

    // Create a new input element
    var input = document.createElement('input');
    input.id = 'hiddenInput';
    input.type = span.getAttribute('data-input-type') || 'number';
    input.name = span.getAttribute('data-input-name') || 'hiddenInput';
    input.placeholder = span.getAttribute('data-input-placeholder') || 'Num of midline crossings';
    input.value = span.textContent;
    input.style.cssText = span.style.cssText;

    // Replace the span with the input
    span.parentNode.replaceChild(input, span);
}


var IABtask = function () {

	// Stimuli for a basic Stroop experiment	
	psiTurk.recordUnstructuredData("condition", condition); // type of stimulus

	console.log(condition)
	//var Num_Entered = false;
	psiTurk.showPage('stage.html');

	// generate random video index list 
	const TotalNumVideos = 110; // set to 5 for piloting code, but will use large number in exp
	//var vid_num = _.range(1, TotalNumVideos + 1);// for piloting code only
	var vid_num = getRandomSample(5, TotalNumVideos);// to randomly sample video
	var vidlist = [];
	var vidID = [];
	//var folderID=0;
	var trialindex = 0;
	//var current_video;
	var correct = 0;

	var updateTrialNumber = function (trialNumber) {
		var trialNumberElement = document.getElementById('trial-number');
		if (trialNumberElement) {
			trialNumberElement.textContent = 'Trial ' + trialNumber;
		}
	};

	//// preload videos and corresponding text files
	for (i = 0; i < vid_num.length; i++) {
		var vid_name = "video_" + vid_num[i] + ".mp4";
		// var text_name = "text" + vid_num[i] + ".txt"; // Corresponding text file
		vidlist.push({ video: vid_name });
	}
	
	// Initial the player
	mplayer = videojs('my-video-exp');
	// mplayer.src

	// mplayer.on("canplaythrough", function(){
	//   mplayer.on('fullscreenchange', function () {
	//   	if (!myPlayer.isFullscreen()) {
	//       mplayer.requestFullscreen();
	//     }
	//   });
	// });

	var next = async function () {
	//var next = function () {
		//console.log("next called")
		if (vidlist.length === 0) {
			// some thing
			finish();
		} else {
			var escFullscreen = false;
			//folderID= Math.floor(Math.random() * 2); // randomly pick 0 or 1 (for shading gradient)
			vidID = vidlist.shift();
			
			console.log(vidID)
			if(trialindex<4){
				video_src = "https://iabshui.s3.amazonaws.com/test_vids/" + folderNames[mycondition] + "/NoTarget/" + vidID.video;
			} else {
				video_src = "https://iabshui.s3.amazonaws.com/test_vids/" + folderNames[mycondition] + "/TargetPresent/" + vidID.video;
			}

			console.log(video_src)
			
			mplayer.src({
				src: video_src,
				type: "video/mp4"
			})

			trialindex += 1;
			updateTrialNumber(trialindex);
			console.log(trialindex)
			var button = document.getElementById('exp_play');
			button.style.display = 'none';
			button.innerText = 'Play Video';
			
			mplayer.on("canplaythrough", function () {
				button.style.display = 'block';
			  });
			button.onclick = function () {
				mplayer_ended = false
				mplayer.requestFullscreen();
				mplayer.play()
			}


			mplayer.on('fullscreenchange', function () {
				console.log('fullscreen change!')
				if (!mplayer.isFullscreen() && !mplayer_ended) {
					console.log
					console.log(mplayer.currentTime())
					console.log(mplayer.duration())
					escFullscreen = true;
					mplayer.currentTime(mplayer.duration());
				}
			})

			mplayer.on("ended", function () {
				mplayer_ended = true
				console.log(escFullscreen)
				if (!escFullscreen) {
					changeToInput();
					mplayer.exitFullscreen();
					var hiddenInput = document.getElementById('hiddenInput');
					hiddenInput.style.display = 'block';
					document.getElementById('exp_play').innerText = 'Submit';

					play_button = document.getElementById("exp_play")
					// Disable the button by default
					play_button.disabled = true;

					// Add an event listener to the input field
					hiddenInput.addEventListener('input', function() {
					    // Enable the button only if the input has a valid number
					    play_button.disabled = !this.value.trim() || isNaN(parseInt(this.value));
					});
					// upon clicking the button
					play_button.onclick = function () {
						var hiddenInput = document.getElementById('hiddenInput');
						input_value = parseInt(hiddenInput.value)
						console.log(input_value)

						changeToText()

						var hiddenInput = document.getElementById('hiddenInput');
						hiddenInput.innerText = "Answer recorded! WAIT for the next video to load before playing";

						psiTurk.recordTrialData({ 'trial': trialindex, 'video_src': video_src, 'input': input_value});
						next();
					}

				} else {
					alert("You exited fullscreen mid trial. You may not proceed.");
					window.close();
				}

			});

		}

	};

	var finish = function () {
		//$("body").unbind("keydown", response_handler); // Unbind keys
		currentview = new Questionnaire();
	};


	// Start the test; initialize everything
	next();
	
	///////////// Function definitions //////////

	// Function to generate random sample of integers without replacement
	function getRandomSample(size, max) {
		const numbers = Array.from({ length: max }, (_, i) => i + 1);
		const sample = [];

		for (let i = 0; i < size; i++) {
			const randomIndex = Math.floor(Math.random() * numbers.length);
			sample.push(numbers[randomIndex]);
			numbers.splice(randomIndex, 1);
		}

		return sample;
	}


};


/****************
* Questionnaire *
****************/

var Questionnaire = function () {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function () {

		psiTurk.recordTrialData({ 'phase': 'postquestionnaire', 'status': 'submit' });

		// $('select').each(function (i, val) {
		// 	psiTurk.recordUnstructuredData(this.id, this.value);
		// });
		$('select, input[type="text"]').each(function (i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});

	};

	prompt_resubmit = function () {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function () {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function () {
				clearInterval(reprompt);
				psiTurk.completeHIT();
			},
			error: prompt_resubmit
		});
	};

	function checkAllAnswered() {
		var allAnswered = true;
		
		// Check select elements
		$('select').each(function() {
			if ($(this).val() === '' || $(this).val() === 'default') {
				allAnswered = false;
				return false; // exit the loop early
			}
		});
		
		// Check text input elements
		$('input[type="text"]').each(function() {
			if ($(this).val().trim() === '') {
				allAnswered = false;
				return false; // exit the loop early
			}
		});
		
		return allAnswered;
	}

    function updateNextButton() {
        $("#next").prop('disabled', !checkAllAnswered());
    }

    // Load the questionnaire snippet
    psiTurk.showPage('postquestionnaire.html');
    psiTurk.recordTrialData({ 'phase': 'postquestionnaire', 'status': 'begin' });

    // Disable the Next button initially
    $("#next").prop('disabled', true);

    // Add change event listener to all select elements
    $('select').on('change', updateNextButton);
	$('input[type="text"]').on('input', updateNextButton);

    $("#next").click(function () {
        if (checkAllAnswered()) {
            record_responses();
            psiTurk.saveData({
                success: function () {
                    psiTurk.completeHIT(); // when finished saving compute bonus, then quit
                },
                error: prompt_resubmit
            });
        }
    });


};

// Task object to keep track of the current phase
var currentview;

document.addEventListener('resolutionMeasured', function (event) {
    var width = event.detail.width;
    var height = event.detail.height;
	var refreshRate = event.detail.refreshRate;
	console.log("Resolution: " + width + "x" + height + " @ " + refreshRate);
    // Record the resolution data using psiTurk
    psiTurk.recordUnstructuredData('screen_width', width);
    psiTurk.recordUnstructuredData('screen_height', height);
	psiTurk.recordUnstructuredData('refresh_rate', refreshRate);
});
/*******************
 * Run Task
 ******************/
// In this example `task.js file, an anonymous async function is bound to `window.on('load')`.
// The async function `await`s `init` before continuing with calling `psiturk.doInstructions()`.
// This means that in `init`, you can `await` other Promise-returning code to resolve,
// if you want it to resolve before your experiment calls `psiturk.doInstructions()`.

// The reason that `await psiTurk.preloadPages()` is not put directly into the
// function bound to `window.on('load')` is that this would mean that the pages
// would not begin to preload until the window had finished loading -- an unnecessary delay.
$(window).on('load', async () => {
	await init;
	psiTurk.doInstructions(
		instructionPages, // a list of pages you want to display in sequence
		function () { currentview = new IABtask(); } // what you want to do when you are done with instructions
	);
});
