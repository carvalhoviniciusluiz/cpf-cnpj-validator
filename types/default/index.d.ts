import * as Joi from 'joi'
declare const _default: {
    base: Joi.StringSchema
    name: string
    language: {
        cnpj: string
        cpf: string
    }
    rules: {
        name: string
        validate(_params: any, value: any, state: any, options: any): any
    }[]
}
export = _default

export declare const verifierDigit: Function
export declare const strip: Function
export declare const format: Function
export declare const isValid: Function
export declare const generate: Function
