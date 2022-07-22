let url;
let answerArray = [];
const showUserRes = document.getElementById("show-user-response");
const responseWrapper = document.getElementById("responses-wrapper");
const showApiRes = document.getElementById("show-api-response");
const correctionResponse = document.getElementById("response-correction");
const testbutton = document.getElementById("finish");
const allContent = document.getElementById("all-content");

//********************************
// FIND NUMBER AND RETURN DYNAMIC URL
function findNumber() {
	let inputSelect = document.getElementById("number-select");
	let numberValue = inputSelect.options[inputSelect.selectedIndex].value;
	url = `https://opentdb.com/api.php?amount=${numberValue}`;

	displayData();
}

//********************************
// FETCH DATA FROM API. called in displayData()
const fetchData = async () => {
	await fetch(url)
		.then((res) => res.json())
		.then((data) => (answerArray = data.results))
		.catch((err) => console.log(err.message));
};

//********************************
// DISPLAY DATA WITH NEXT VALUE. called in findNumber()
const displayData = async () => {
	await fetchData();

	localStorage.setItem(
		"ApiResponse",
		answerArray.map((el) => el.correct_answer)
	);

	const answerContent = document.getElementById("answer-content");
	const choices = document.getElementById("choice-content");

	showNextquestions(answerContent, choices);
};

// Get choices randomized. Called in showNextquestions(arg, arg)
function getRandomChoice(current, array) {
	current.incorrect_answers.map((el) => array.push(el));
	array.push(current.correct_answer);

	array = array.sort(function () {
		return Math.random() - 0.5;
	});

	return array;
}

// Get response at each click. Called in showNextquestions(arg, arg)
function getResponse(array) {
	var ele = document.getElementsByName("input-button");

	for (i = 0; i < ele.length; i++) {
		if (ele[i].checked) {
			array.push(ele[i].value);
		}
	}
	localStorage.setItem("UserResponse", array);
	return array;
}

// Show questions and stock in LocalStorage. Called in displayData()
function showNextquestions(content, choice) {
	let arrayIterator = answerArray.values();
	const nextButton = document.getElementById("next-question");
	let response = [];

	nextButton.onclick = function () {
		let currentValue = arrayIterator.next().value;
		let arrayChoice = [];

		getResponse(response);

		// Break function onclick
		if (currentValue == undefined) {
			showScore();
			return;
		}

		getRandomChoice(currentValue, arrayChoice);

		content.innerHTML = `
         <div> 
            <h3> ${currentValue.question} </h3>
        </div> 
        `;

		choice.innerHTML = arrayChoice
			.map(
				(response) => `
                  <div> 
                        <input type="radio" id="${response}" name="input-button" value="${response}">
                        <label for="${response}">${response}</label>
                  </div> 
               `
			)
			.join(" ");
	};
}

//**********************
//***** SHOW SCORE *****
// Show score after end of questions. Called in showNextquestions(arg, arg) when breaked
function showScore() {
	testbutton.style.display = "block";
	allContent.innerHTML = `
      <h1> Vous avez répondu à toute les questions! </h1>
   `;
	testbutton.onclick = function () {
		let finalUserArray = localStorage.getItem("UserResponse").split(",");
		let finalApiArray = answerArray.map((el) => el.correct_answer);
		let arr = [];
		let goodAnswerLength = intersect_arrays(
			finalUserArray,
			finalApiArray
		).length;

		//
		correctOrNot(arr, finalUserArray, finalApiArray);
		mapScore(correctionResponse, arr, "Correction");
		mapScore(showUserRes, finalUserArray, "Your responses :");
		mapScore(showApiRes, finalApiArray, "Real Response");
	};
}

function intersect_arrays(a, b) {
	var sorted_a = a.concat().sort();
	var sorted_b = b.concat().sort();
	var common = [];
	var a_i = 0;
	var b_i = 0;

	while (a_i < a.length && b_i < b.length) {
		if (sorted_a[a_i] === sorted_b[b_i]) {
			common.push(sorted_a[a_i]);
			a_i++;
			b_i++;
		} else if (sorted_a[a_i] < sorted_b[b_i]) {
			a_i++;
		} else {
			b_i++;
		}
	}
	return common;
}
function mapScore(htmlElement, array, message) {
	htmlElement.innerHTML = array
		.map(
			(res) => `
<li>
${res}
</li>
`
		)
		.join(" ");
	htmlElement.insertAdjacentHTML("afterbegin", `<h4> ${message} </h4>`);
}

function mapUserResponse(htmlElement, array, arrayGood) {
	htmlElement.innerHTML = array
		.map(
			(res) => `
<li>
${res}
</li>
`
		)
		.join(" ");

	htmlElement.insertAdjacentHTML(
		"afterbegin",
		`<h4> Your responses :  <span> ${arrayGood}/${array.length} </span> </h4>`
	);
}
function mapCorrectionResponse(htmlElement, array) {
	htmlElement.innerHTML = array
		.map(
			(res) => `
<li>
${res}
</li>
`
		)
		.join(" ");
	htmlElement.insertAdjacentHTML("afterbegin", `<h4> Correction </h4>`);
}
function correctOrNot(arr, userArray, apiArray) {
	for (let i = 0; i < userArray.length; i++) {
		arr.push(userArray[i] == apiArray[i]);
	}

	arr = arr.map(function (item) {
		return item == false ? "mauvaise réponse" : "bonne réponse !";
	});

	return arr;
}
