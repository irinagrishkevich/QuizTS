import {Form} from "./components/form";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Answers} from "./components/answers";
import {Auth} from "./services/auth";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly profileElement: HTMLElement | null;
    readonly profileFullNameElement: HTMLElement | null;

    private routers: {route: string, title: string, template: string, styles: string, load: () => void}[];

    constructor() {
        this.contentElement = document.getElementById('content')
        this.stylesElement = document.getElementById('style')
        this.titleElement = document.getElementById('title-page')
        this.profileElement = document.getElementById('profile')
        this.profileFullNameElement = document.getElementById('profile-full-name')

        this.routers = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'style/style.css',
                load: () => {
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'style/form.css',
                load: () => {
                    new Form('signup')
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'style/form.css',
                load: () => {
                    new Form('login')
                }
            },
            {
                route: '#/choice',
                title: 'Выбор Теста',
                template: 'templates/choice.html',
                styles: 'style/choice.css',
                load: () => {
                    new Choice()
                }
            },
            {
                route: '#/test',
                title: 'Тест',
                template: 'templates/test.html',
                styles: 'style/test.css',
                load: () => {
                    new Test()
                }
            },
            {
                route: '#/result',
                title: 'Результат',
                template: 'templates/result.html',
                styles: 'style/result.css',
                load: () => {
                    new Result()
                }
            },
            {
                route: '#/answers',
                title: 'Правильные Ответы',
                template: 'templates/answers.html',
                styles: 'style/answers.css',
                load: () => {
                    new Answers()
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0]
        if (urlRoute === '#/logout'){
            await Auth.logout()
            window.location.href = '#/'
            return;
        }
        const newRoute = this.routers.find(item => item.route === urlRoute)

        if (!newRoute) {
            window.location.href = '#/'
            return
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text())
        this.stylesElement.setAttribute('href', newRoute.styles)
        this.titleElement.innerText = newRoute.title

        const userInfo = Auth.getUserInfo()
        const accessToken = localStorage.getItem(Auth.accessTokenKey)
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex'
            this.profileFullNameElement.innerText= userInfo.fullName
        }else {
            this.profileElement.style.display = 'none'
        }


        newRoute.load()
    }

}