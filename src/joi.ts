import type { Extension, Root } from 'joi'
import cnpj from './cnpj'
import cpf from './cpf'

/**
 * Cria uma extensão joi que adiciona o tipo `document` com os métodos
 * `.cpf()` e `.cnpj()`. Use com `joi.extend(joiValidator)`.
 *
 * @param joi - Instância do joi (versão 17+).
 * @returns Extension pronta para passar em `joi.extend`.
 *
 * @example
 * ```ts
 * import Joi from 'joi'
 * import { joiValidator } from 'cpf-cnpj-validator/joi'
 *
 * const joi = Joi.extend(joiValidator)
 * const schema = joi.document().cnpj().required()
 * await schema.validateAsync('12ABC34501DE35') // '12ABC34501DE35'
 * ```
 */
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
