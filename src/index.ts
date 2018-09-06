import * as Joi from 'joi'
import * as cpf from './cpf'
import * as cnpj from './cnpj'

export { cpf, cnpj }

export default {
  base: Joi.string(),
  name: 'document',
  language: {
    cnpj: 'informado é inválido',
    cpf: 'informado é inválido'
  },
  rules: [{
    name: 'cnpj',
    validate (_params, value, state, options) {
      if (!cnpj.isValid(value)) {
        return this.createError('document.cnpj', { v: value }, state, options)
      }

      return value
    }
  }, {
    name: 'cpf',
    validate (_params, value, state, options) {
      if (!cpf.isValid(value)) {
        return this.createError('document.cpf', { v: value }, state, options)
      }

      return value
    }
  }]
}
