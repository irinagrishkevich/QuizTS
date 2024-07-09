import {Form} from "./components/form";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Answers} from "./components/answers";
import {Auth} from "./services/auth";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly profileElement: HTMLElement | null;
    readonly profileFullNameElement: HTMLElement | null;

    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content')
        this.stylesElement = document.getElementById('style')
        this.titleElement = document.getElementById('title-page')
        this.profileElement = document.getElementById('profile')
        this.profileFullNameElement = document.getElementById('profile-full-name')

        this.routes = [
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

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0]
        if (urlRoute === '#/logout'){
            const result:boolean = await Auth.logout()
            if (result){
                window.location.href = '#/'
                return;
            } else{
                alert('Ошибка выхода')
            }

        }
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute)

        if (!newRoute) {
            window.location.href = '#/'
            return
        }

        if (!this.contentElement || !this.stylesElement || !this.titleElement || !this.profileElement || !this.profileFullNameElement) {
            if (urlRoute === '#/') {
                return
            }else{
                window.location.href = '#/'
                return
            }
        }
        // проверка на null и undefined в случае если элемент не существует, что приведет к ошибке в работе кода
        // поэтому проверяем на null и undefined в случае если элемент существует, то продолжаем работу и ошибки нет
        // в начале мы определили элементы и даем им типы HTMLElement | null

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text())
        this.stylesElement.setAttribute('href', newRoute.styles)
        this.titleElement.innerText = newRoute.title

        const userInfo: UserInfoType | null = Auth.getUserInfo()
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey)
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex'
            this.profileFullNameElement.innerText= userInfo.fullName
        }else {
            this.profileElement.style.display = 'none'
        }


        newRoute.load()
    }

}