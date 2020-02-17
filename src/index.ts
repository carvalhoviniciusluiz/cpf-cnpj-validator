import cpf from './cpf'
import cnpj from './cnpj'

export { cpf, cnpj }

export const validator = joi => ({
  base: joi.string(),
  name: 'document',
  language: {
    cnpj: 'informado é inválido',
    cpf: 'informado é inválido'
  },
  rules: [
    {
      name: 'cnpj',
      validate(_, value, state, options) {
        if (!cnpj.isValid(value)) {
          return this.createError(
            'document.cnpj',
            { v: value },
            state,
            options
          );
        }

        return value;
      },
    }, {
      name: 'cpf',
      validate (_: any, value: string, state: any, options: any) {
        if (!cpf.isValid(value)) {
          return this.createError('document.cpf', { v: value }, state, options)
        }

        return value
      }
    }
  ],
})

export default validator;
