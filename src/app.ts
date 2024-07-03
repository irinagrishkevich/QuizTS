import {Router} from "./router";

class App {
    private router: Router;

    constructor() {
        this.router = new Router()
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this))
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))
        // window.addEventListener('popstate', () => {
        //     this.router.openRoute()
        // })
    }
    private handleRouteChanging(): void {
        this.router.openRoute().then()
    }
}

(new App())


// SPA приложение, то не можем открыть без http server
// в json text - '' меняем на start - 'http-start
// npm start - чтобы запустить сервер