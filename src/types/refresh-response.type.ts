export type RefreshResponseType = {
    accessToken?: string, // ? поле не обязательно, может быть пустым
    refreshToken?: string,
    error: boolean,
    message: string
}