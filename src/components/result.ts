import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";
import * as querystring from "querystring";

export class Result {
    // url:null,
    constructor() {
        this.answersButtonElement = null

        this.routeParams = UrlManager.getQueryParams()
        this.init()

    }
    async init() {
        const userInfo = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
        }
        if (this.routeParams.id){
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId)
                let testId = this.routeParams.id
                if (result) {
                    const that = this
                    if (result.error) {
                        throw new Error(result.error)
                    }
                    document.getElementById('result-scope').innerText = result.score +
                        '/' + result.total
                    this.answersButtonElement = document.getElementById('link')
                    this.answersButtonElement.addEventListener('click', function () {
                        location.href = '#/answers?id=' + testId
                    });
                    return
                }

            } catch (error) {
                console.error(error)
            }
        }
        location.href = '#/'


    }
}

