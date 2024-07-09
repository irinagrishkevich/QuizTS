import config from "../../config/config";
import {UserInfoType} from "../types/user-info.type";
import {RefreshResponseType} from "../types/refresh-response.type";
import {logoutResponseType} from "../types/logout-response.type";

export class Auth {

    public static accessTokenKey: string = 'accessToken'
    private static refreshTokenKey: string = 'refreshToken' //используется только в рамках этого класса - private
    private static userInfoKey: string = 'userInfo'
    private static emailKey: string = 'email'


    public static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey)
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })

            if (response && response.status === 200) {
                const result: RefreshResponseType | null = await response.json()
                if (result && !result.error && result.accessToken && result.refreshToken) { //доп проверка на наличие токенов в ответе, ибо указан в файле refresh-response.type string или поля может не быть(undefined)
                    this.setTokens(result.accessToken, result.refreshToken)
                    return true
                    // } else {
                    //     throw new Error(result.message)
                    // }
                }
            }
        }

        this.removeTokens()
        location.href = '#/'
        return false
    }

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey)
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })

            if (response && response.status === 200) {
                const result: logoutResponseType | null = await response.json()
                if (result && !result.error) {
                    this.removeTokens()
                    localStorage.removeItem(this.userInfoKey)
                    return true
                } else {
                    throw new Error(response.statusText)
                }
            }
        }
        return false


    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info))
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey)
        if (userInfo) {
            return JSON.parse(userInfo)
        }
        return null
    }

    public static setEmail(email: string): void {
        localStorage.setItem(this.emailKey, email);
    }

    public static getEmail():string | null {
        const userInfoEmail: string | null = localStorage.getItem(this.emailKey)
        if (userInfoEmail) {
            return userInfoEmail
        }
        return null
    }
}