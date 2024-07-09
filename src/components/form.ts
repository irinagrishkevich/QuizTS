import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";

export class Form {
    readonly agreeElement: HTMLInputElement | null
    private processElement: HTMLElement | null
    readonly page: 'signup' | 'login' // этот тип использует два раза, поэтому можно его и вынести
    private fields: FormFieldType[] = []


    constructor(page: 'signup' | 'login') {
        this.page = page
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey)
        if (accessToken) {
            location.href = '#/choice'
            return
        }
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            },
        ]

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false
                })
        }

        const that: Form = this
        this.fields.forEach((item: FormFieldType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement
            if(item.element){
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this)
                }
            }

        })
        this.processElement = document.getElementById('process')
        if (this.processElement){
            this.processElement.onclick = function () {
                that.processForm()
            }
        }


        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree') as HTMLInputElement
            //операция document.getElementById возвращает HTMLElement поэтому делаем утверждение что это HTMLInputElement чтоб checked работало
            if (this.agreeElement){
                this.agreeElement.onchange = function () {
                    that.validateForm()
                }
            }
        }


    }

    private validateField(field: FormFieldType, element: HTMLInputElement):void {
        if(element.parentNode){
            if (!element.value || !element.value.match(field.regex)) {
                (element.parentNode as HTMLElement).style.borderColor = 'red'
                field.valid = false
            } else {
                (element.parentNode as HTMLElement).removeAttribute('style')
                field.valid = true
            }
        }
        this.validateForm()
    }

    private validateForm() :boolean {
        const validForm: boolean = this.fields.every(item => item.valid)
        const isValid: boolean = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if(this.processElement){
            if (isValid) {
                this.processElement.removeAttribute('disabled')
            } else {
                this.processElement.setAttribute('disabled', 'disabled')
            }
        }
        return isValid
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email')?.element?.value
            //?  ?  если у нас чего их этой цепочки нет, то мы получим null
            if(email){
                Auth.setEmail(email)
            }
            const password = this.fields.find(item => item.name === 'password')?.element?.value

            if (this.page === 'signup') {
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name')?.element?.value,
                        lastName: this.fields.find(item => item.name === 'lastName')?.element?.value,
                        email: email,
                        password: password
                    })

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message)
                        }
                    }

                } catch (error) {
                    return console.error(error)
                }
            }
            try {
                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password
                })

                if (result) {
                    if (result.error || !result.accessToken || !result.refreshToken ||
                        !result.fullName || !result.userId) {
                        throw new Error(result.message)
                    }
                    Auth.setTokens(result.accessToken, result.refreshToken)
                    Auth.setUserInfo({
                        fullName: result.fullName,
                        userId: result.userId
                    })
                    location.href = '#/choice'
                }

            } catch
                (error) {
                console.error(error)
            }


            // let formData = {}
            // let paramString = ''
            // this.fields.forEach(item => {
            //     paramString += (!paramString ? '?' : '&') + item.name + '=' + item.element.value
            //     formData[item.name] = item.element.value
            // })
            // sessionStorage.setItem('formData', JSON.stringify(formData));
            // location.href = '#/choice' + paramString

        }
    }
}
