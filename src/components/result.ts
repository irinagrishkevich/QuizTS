import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import * as querystring from "querystring";
import {QueryParamsType} from "../types/query-params.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/defaul-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Result {
    private routeParams: QueryParamsType;
    private answersButtonElement : HTMLElement | null;
    // url:null,
    constructor() {
        this.answersButtonElement = null;
        this.routeParams = UrlManager.getQueryParams()
        this.init()

    }
    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo()
        if (!userInfo) {
            location.href = '#/'
            return  // если делаем редирект то лучше завершить функцию
        }
        if (this.routeParams.id){
            try {
                const result: PassTestResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result?userId=' + userInfo.userId)
                let testId = this.routeParams.id
                if (result) {
                    const that = this
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message)
                    }
                    const resultScopeElement: HTMLElement | null = document.getElementById('result-scope')
                    if (resultScopeElement) {
                        resultScopeElement.innerText = ( result as PassTestResponseType).score +
                            '/' + (result as PassTestResponseType).total
                    }

                    this.answersButtonElement = document.getElementById('link')
                    if (this.answersButtonElement) {
                        this.answersButtonElement.addEventListener('click', function () {
                            location.href = '#/answers?id=' + testId
                        });
                    }
                    return
                }

            } catch (error) {
                console.error(error)
            }
        }
        location.href = '#/'


    }
}

