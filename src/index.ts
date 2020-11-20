import cpf from './cpf'
import cnpj from './cnpj'
export { cpf, cnpj }

import { AngularValidator } from './angular-validator'
export { AngularValidator };

export const validator = joi => ({
  type: 'document',
  base: joi.string(),
  messages: {
    'document.cpf': 'CPF inválido',
    'document.cnpj': 'CNPJ inválido'
  },
  rules: {
    cpf: {
      validate(value: any, helpers: any, args: any, options: any) {
        if (!cpf.isValid(value)) {
          return helpers.error('document.cpf');
        }

        return value
      }
    },
    cnpj: {
      validate(value: any, helpers: any, args: any, options: any) {
        if (!cnpj.isValid(value)) {
          return helpers.error('document.cnpj');
        }

        return value
      }
    }
  }
});

export default validator;
