import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizAnswerType, QuizQuestionType, TestFindType} from "../types/quiz.type";
import {QueryParamsType} from "../types/query-params.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/defaul-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";
import {TestAnswerType} from "../types/test-answer.type";


export class Answers {
    private quiz: TestFindType | null
    private userInfo: UserInfoType | null
    private questionElement: HTMLElement | null
    private resultButtonElement: HTMLElement | null
    private optionsElement: HTMLElement | null
    private optionElement: HTMLElement | null
    private currentQuestionIndex: number
    private chosenAnswersIds: number[]
    private quizAnswersRight: TestAnswerType[]
    private routeParams: QueryParamsType

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
        this.userInfo = Auth.getUserInfo()
        if (!this.userInfo) {
            location.href = '#/'
            return
        }

        this.init()
        const testUserElement: HTMLElement | null = document.getElementById('test-user')
        if (testUserElement) {
            if(this.userInfo){
                testUserElement.innerHTML = 'Тест выполнил: ' + '<span>' + this.userInfo.fullName + ', ' + Auth.getEmail() + '</span>'
            }
        }
        this.resultButtonElement = document.getElementById('link')
        const that = this
        if (this.resultButtonElement) {
            this.resultButtonElement.addEventListener('click', function () {
                location.href = '#/result?id=' + that.routeParams.id
            });
        }

    }

    private async init(): Promise<void> {
        if (!this.userInfo) {
            location.href = '#/'
            return
        }
        try {
            const result: TestAnswerType[] | DefaultResponseType = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + this.userInfo.userId)
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }
                this.quizAnswersRight = result as TestAnswerType[]
            }

        } catch (error) {
            console.error(error)
        }


        try {
            const result: TestFindType | DefaultResponseType   = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + this.userInfo.userId)

            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message)
                }
                this.quiz = result as TestFindType

            }

        } catch (error) {
            return console.error(error)
        }
        this.start()

    }


    private start(): void {
        if (!this.quiz) return
        this.quiz.test.questions.forEach((question:QuizQuestionType, index:number) => {
            this.currentQuestionIndex = index + 1;
            this.showQuestion();
        });
    }

    private showQuestion(): void {
        if (!this.quiz) return
        const testNameElement: HTMLElement | null = document.getElementById('test-name')
        if (testNameElement){
            testNameElement.innerText = this.quiz.test.name

        }
        const activeQuestion: QuizQuestionType = this.quiz.test.questions[this.currentQuestionIndex - 1];

        const questionElement: HTMLElement | null = document.createElement('div');
        questionElement.className = 'common-question-title';
        if (questionElement){
            questionElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ': </span>' + activeQuestion.question;
        }

        const optionsElement: HTMLElement | null = document.createElement('div');
        optionsElement.className = 'answers-options';

        const allQuestionAndAnswers: HTMLElement | null = document.createElement('div');
        allQuestionAndAnswers.className = 'all-question-and-answers'


        activeQuestion.answers.forEach((answer: QuizAnswerType) => {

            const optionElement: HTMLElement | null = document.createElement('div');
            optionElement.className = 'answers-question-option';

            const inputId:number = answer.id;
            const inputName: number = activeQuestion.id;
            const inputElement: HTMLInputElement | null = document.createElement('input');
            inputElement.className = 'option-answer';
            if (inputElement){
                inputElement.setAttribute('id', inputId.toString());
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', inputName.toString());
                inputElement.setAttribute('value', answer.id.toString());
                inputElement.setAttribute('disabled', 'disabled');
            }


            const labelElement: HTMLElement | null = document.createElement('label');
            if (labelElement){
                labelElement.setAttribute('for', inputId.toString());
                labelElement.innerText = answer.answer;
            }


            optionElement.appendChild(inputElement);
            optionElement.appendChild(labelElement);

            optionsElement.appendChild(optionElement);
            allQuestionAndAnswers.appendChild(questionElement);
            allQuestionAndAnswers.appendChild(optionsElement);
            if (this.chosenAnswersIds.includes(answer.id)) {
                inputElement.setAttribute('checked', 'checked');
                const correctAnswer: TestAnswerType | undefined = this.quizAnswersRight.find((correct:TestAnswerType):boolean => correct.correct && correct.user_id === answer.id);
                if (correctAnswer) {
                    inputElement.classList.add('correct');
                } else {
                    inputElement.classList.add('un-correct');
                }
            }
            if (answer.correct) {
                inputElement.classList.add('correct');
            } else if (answer.correct === false) {
                inputElement.classList.add('un-correct');

            }
        });
        const questionBlockElement: HTMLElement | null = document.getElementById('question')
        if (questionBlockElement){
            questionBlockElement.appendChild(allQuestionAndAnswers)
        }
    }
}



