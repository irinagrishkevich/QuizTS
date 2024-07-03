import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Answers {
    constructor() {
        this.quiz = null
        this.questionElement = null
        this.resultButtonElement = null
        this.optionsElement = null
        this.optionElement = null
        this.currentQuestionIndex = 0
        this.chosenAnswersIds = []
        this.quizAnswersRight = []
        this.routeParams = UrlManager.getQueryParams()


        this.init()

        document.getElementById('test-user').innerHTML = 'Тест выполнил: ' + '<span>' + Auth.getUserInfo().fullName + ', ' + Auth.getEmail() + '</span>'
        this.resultButtonElement = document.getElementById('link')
        const that = this
        this.resultButtonElement.addEventListener('click', function () {
            location.href = '#/result?id=' + that.routeParams.id
        });
    }

    async init() {
        const userInfo = Auth.getUserInfo()
        try {
            const result = await CustomHttp.request(config.host +'/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId)
            if (result) {
                if (result.error) {
                    throw new Error(result.error)
                }
                this.quizAnswersRight = result
            }

        } catch (error) {
            console.error(error)
        }


        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host +'/tests/' + this.routeParams.id + '/result/details?userId=' + userInfo.userId)

                if (result) {
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    this.quiz = result
                }

            } catch (error) {
                return console.error(error)
            }

        }
        this.start()

    }


    start() {
        this.quiz.test.questions.forEach((question, index) => {
            this.currentQuestionIndex = index + 1;
            this.showQuestion();
        });
    }

    showQuestion() {
        document.getElementById('test-name').innerText = this.quiz.test.name
        const activeQuestion = this.quiz.test.questions[this.currentQuestionIndex - 1];
        console.log(activeQuestion)
        const questionElement = document.createElement('div');
        questionElement.className = 'common-question-title';
        questionElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ': </span>' + activeQuestion.question;

        const optionsElement = document.createElement('div');
        optionsElement.className = 'answers-options';

        const allQuestionAndAnswers = document.createElement('div');
        allQuestionAndAnswers.className = 'all-question-and-answers'


        activeQuestion.answers.forEach(answer => {

            const optionElement = document.createElement('div');
            optionElement.className = 'answers-question-option';

            const inputId = answer.id;
            const inputName = activeQuestion.id;
            const inputElement = document.createElement('input');
            inputElement.className = 'option-answer';
            inputElement.setAttribute('id', inputId);
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', inputName);
            inputElement.setAttribute('value', answer.id);
            inputElement.setAttribute('disabled', 'disabled');


            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', inputId);
            labelElement.innerText = answer.answer;

            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            optionsElement.appendChild(optionElement);
            allQuestionAndAnswers.appendChild(questionElement);
            allQuestionAndAnswers.appendChild(optionsElement);
            if (this.chosenAnswersIds.includes(answer.id.toString())) {
                inputElement.setAttribute('checked', 'checked');
                const correctAnswer = this.quizAnswersRight.find(correct => correct === answer.id);
                if (correctAnswer) {
                    inputElement.classList.add('correct');
                } else {
                    inputElement.classList.add('un-correct');
                }
            }
            if (answer.correct === true) {
                    inputElement.classList.add('correct');
                } else if(answer.correct === false){
                    inputElement.classList.add('un-correct');

            }
        });
        document.getElementById('question').appendChild(allQuestionAndAnswers)
    }
}



