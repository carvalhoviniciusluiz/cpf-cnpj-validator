import type { Extension, Root } from 'joi'
import cnpj from './cnpj'
import cpf from './cpf'

export const joiValidator = (joi: Root): Extension => ({
  type: 'document',
  base: joi.string(),
  messages: {
    'document.cpf': 'CPF inválido',
    'document.cnpj': 'CNPJ inválido'
  },
  rules: {
    cpf: {
      validate(value, helpers) {
        return cpf.isValid(value) ? value : helpers.error('document.cpf')
      }
    },
    cnpj: {
      validate(value, helpers) {
        return cnpj.isValid(value) ? value : helpers.error('document.cnpj')
      }
    }
  }
})
