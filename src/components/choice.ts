import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QueryParamsType} from "../types/query-params.type";
import {QuizListType} from "../types/quiz-list.type";
import {TestResultType} from "../types/test-result.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/defaul-response.type";

export class Choice {
    private quizzes: QuizListType[] = [] //создать переменные в классе, те сделать их свойствами нашего класса
    private routeParams: QueryParamsType
    private testResult: TestResultType[] | null = null //тк с бэкеда мы получеам массив
    constructor() {
        this.routeParams = UrlManager.getQueryParams()

        this.init()

    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(config.host + '/tests')// На Backendе нет проверки на ошибку, поэтому можно оставить без проверки на ошибку
            // if (result) {
            //     if (result.error) {
            //         throw new Error(result.error)
            //     }
            // }
        } catch (error) {
             console.error(error)
            return
        }
        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (userInfo){
            try {
                const result: TestResultType[] | DefaultResponseType = await CustomHttp.request(config.host + '/tests/results?userId='+ userInfo.userId)
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        // если ошибка мы используем тип DefaultResponseType, поэтому error не может существовать в двех типах одновременно
                        // и поэтому мы используем утверждение result и здесь это безопасно
                        throw new Error((result as DefaultResponseType).message)
                    }
                    //если мы дошли, то здесь мы утверждаем что result это массив типа TestResultType
                    this.testResult = result as TestResultType[]

                }

            } catch (error) {
                 console.error(error)
                return
            }

        }
        this.processQuizzes()

    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice-options')
        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {
            this.quizzes.forEach((quiz: QuizListType) => {
                const that: Choice = this
                const choiceOptionElement: HTMLElement | null = document.createElement('div')
                choiceOptionElement.className = 'choice-option'
                choiceOptionElement.setAttribute('data-id', quiz.id.toString())//здесь мы передавали number
                choiceOptionElement.onclick = function (): void {
                    //мы знаем что здесь будет находиться элемент класса Choice
                    //и поэтому мы можем использовать тип HTMLElement для вызова функции chooseQuiz
                    that.chooseQuiz(<HTMLElement>this)
                }

                const choiceOptionTextElement: HTMLElement | null = document.createElement('div')
                choiceOptionTextElement.className = 'choice-option-text'
                choiceOptionTextElement.innerText = quiz.name

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('div')
                choiceOptionArrowElement.className = 'choice-option-arrow'

                if (this.testResult){
                    const result: TestResultType | undefined = this.testResult.find(item => item.testId === quiz.id)
                    if (result){
                        const choiceOptionResultElement: HTMLElement | null = document.createElement('div')
                        choiceOptionResultElement.className = 'choice-option-result'
                        choiceOptionResultElement.innerHTML = '<div>Результат</div><div>'+ result.score + '/'+ result.total + '</div>'
                        choiceOptionElement.appendChild(choiceOptionResultElement)
                    }
                }


                const choiceOptionImageElement: HTMLElement | null = document.createElement('img')
                choiceOptionImageElement.setAttribute('src', '/img/arrow.png')
                choiceOptionImageElement.setAttribute('alt', 'arrow')

                choiceOptionArrowElement.appendChild(choiceOptionImageElement)
                choiceOptionElement.appendChild(choiceOptionTextElement)
                choiceOptionElement.appendChild(choiceOptionArrowElement)


                choiceOptionsElement.appendChild(choiceOptionElement)
            })
        }
    }

    private chooseQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id')
        if (dataId) {
            location.href = '#/test?id=' + dataId
        }

    }
}
