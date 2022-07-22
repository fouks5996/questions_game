let url;
let answerArray = [];
const showUserRes = document.getElementById("show-user-response");
const responseWrapper = document.getElementById("responses-wrapper");
const showApiRes = document.getElementById("show-api-response");
const correctionResponse = document.getElementById("response-correction");
const testbutton = document.getElementById("finish");
const allContent = document.getElementById("all-content");
const scoreLength = document.getElementById("score-length");
const title = document.getElementsByClassName("title")[0];
const answerContent = document.getElementById("answer-content");
const choices = document.getElementById("choice-content");

const titleName = document.getElementById("title-name");

// localstorage

let firstName = window.prompt("Saissisez votre nom", "Ex : john doe");
titleName.innerHTML = `<h1 class="title"> Bienvenue ${firstName} dans Questions pour un dev ! </h1>`;

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
	let arrayIndex = answerArray.keys();
	const nextButton = document.getElementById("next-question");
	nextButton.style.display = "block";
	let response = [];

	nextButton.onclick = function () {
		const form = document.getElementById("form");
		form.innerHTML = "";

		title.innerHTML = `C'est parti ! ${arrayIndex.next().value + 1}/${
			answerArray.length
		} `;

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
         <div class="rest"> 
            <h3> ${currentValue.question} </h3>
        </div> 
        `;

		choice.innerHTML = arrayChoice
			.map(
				(response) => `
                  <div class="rest"> 
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
	title.innerHTML = "";
	allContent.innerHTML = `
      <h1 class="title"> Vous avez répondu à toute les questions! </h1>
   `;
	testbutton.onclick = function () {
		testbutton.textContent = "Recommencer";
		testbutton.onclick = function () {
			location.reload();
		};
		let finalUserArray = localStorage.getItem("UserResponse").split(",");
		let finalApiArray = answerArray.map((el) => el.correct_answer);
		let finalApiArrayQuestion = answerArray.map(
			(el) => el.question.substring(0, 30) + `...`
		);
		let correctionArray = [];
		let goodAnswerLength = intersect_arrays(
			finalUserArray,
			finalApiArray
		).length;

		let percentage = (goodAnswerLength / finalApiArray.length) * 100;

		localStorage.setItem(firstName, percentage);

		scoreLength.innerHTML = `<h3> score : ${goodAnswerLength}/${finalApiArray.length} </h3>`;

		//
		for (let i = 0; i < finalUserArray.length; i++) {
			correctionArray.push(finalUserArray[i] == finalApiArray[i]);
		}
		correctionArray = correctionArray.map(function (item) {
			return item == false ? "mauvaise réponse" : "bonne réponse !";
		});
		//
		mapScore(showUserRes, finalUserArray, "Réponses :");
		mapScore(correctionResponse, correctionArray, "Correction :");
		mapScore(showApiRes, finalApiArrayQuestion, "Questions :");
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

function allStorage() {
	var archive = [],
		keys = Object.keys(localStorage),
		key;

	for (let i = 0; (key = keys[i]); i++) {
		const user = {
			nom: key,
			value: localStorage.getItem(key),
		};

		archive.push(user);
	}

	archive.splice(
		archive.findIndex((e) => e.nom.match("UserResponse")),
		1
	);

	archive = archive.sort((a, b) => b.value - a.value);

	if (archive.length > 5) {
		archive.splice(5, archive.length);
	}

	const scoreDiv = document.getElementById("score");
	scoreDiv.innerHTML = archive
		.map(
			(el) => `
			<li> ${el.nom} à un score de ${parseInt(el.value).toFixed(0)}%</li>
		`
		)
		.join(" ");
}

allStorage();
