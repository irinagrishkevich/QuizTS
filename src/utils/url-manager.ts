import {QueryParamsType} from "../types/query-params.type";

export class UrlManager{
    public static getQueryParams(){
        const qs: string = document.location.hash.split('+').join(' ');

        let params:QueryParamsType = {}, // если мы будем использовать этот тип в других файлах, то создаем отдельный файл для типов
            tokens:RegExpExecArray | null,
            re: RegExp = /[?&]([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

}