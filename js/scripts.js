const URL = "https://opentdb.com/api.php?amount=20&" //base URL requesting 20 questions, user only gets 10

//console.log(URL + category + level);

const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const loader = document.getElementById('loader');
const game = document.getElementById('game');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];

let questions = [];

// user prompt for quiz options
var category = prompt("please choose a category 9 for general knowledge, 11 for film and 18 for computers");
var level = prompt("Please choose level, easy, medium or hard");



// user response plus base URL used for API fetch
fetch(URL + "category=" + category + "&difficulty=" + level + "&type=multiple")
    .then((res) => {
        return res.json(); //result parsed into json format
    })
    .then((loadedQuestions) => {
        questions = loadedQuestions.results.map((loadedQuestion) => {
            //console.log(questions);
            const formattedQuestion = {
                question: loadedQuestion.question,
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });
        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_easy = 10;
const CORRECT_med = 20;
const CORRECT_hard = 30;
const MAX_QUESTIONS = 10;

startGame = () => {


    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions]; //spread array of all questions returned
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

//gets new question from array of available questions
getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {

        localStorage.setItem("mostRecentScore", score);

        //go to the end page
        return window.location.assign("game-over.html");
    }
    questionCounter++;

    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

    //update progressbar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    // picks a random question from available question array
    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerHTML = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset["number"];
        choice.innerHTML = currentQuestion["choice" + number];
    });

    availableQuesions.splice(questionIndex, 1); //removes question that has been used
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        // check what level of difficulty before awarding points
        if (classToApply === "correct") {
            if (level === "easy") {
                incrementScore(CORRECT_easy);
            } else if (level === "medium") {
                incrementScore(CORRECT_med);
            } else {
                incrementScore(CORRECT_hard);
            }
        }
        // highlights if answer was right or wrong
        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 2000);
    });
});
// updates score counter
incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};