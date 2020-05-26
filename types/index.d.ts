import cpf from './cpf';
import cnpj from './cnpj';
export { cpf, cnpj };
export declare const validator: (joi: any) => {
    type: string;
    base: any;
    messages: {
        'document.cpf': string;
        'document.cnpj': string;
    };
    rules: {
        cpf: {
            validate(value: any, helpers: any, args: any, options: any): any;
        };
        cnpj: {
            validate(value: any, helpers: any, args: any, options: any): any;
        };
    };
};
export default validator;
