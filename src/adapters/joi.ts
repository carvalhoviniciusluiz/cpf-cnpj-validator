import type { Extension, Root } from 'joi'
import cnpj from '../cnpj'
import cpf from '../cpf'

/**
 * Cria uma extensão joi que adiciona o tipo `document` com os métodos
 * `.cpf(message?)` e `.cnpj(message?)`. Ambos aceitam uma mensagem
 * customizada opcional que sobrescreve a padrão ('CPF inválido' /
 * 'CNPJ inválido') no ValidationError.
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
 *
 * // Mensagem padrão
 * const schema = joi.document().cnpj().required()
 * await schema.validateAsync('12ABC34501DE35') // '12ABC34501DE35'
 *
 * // Mensagem customizada (issue #32)
 * const custom = joi.document().cpf('CPF precisa ser válido!')
 * await custom.validateAsync('01283191283') // throws 'CPF precisa ser válido!'
 * ```
 */
export const joiValidator = (joi: Root): Extension => ({
  type: 'document',
  base: joi.string(),
  messages: {
    'document.cpf': 'CPF inválido',
    'document.cpf.custom': '{{#message}}',
    'document.cnpj': 'CNPJ inválido',
    'document.cnpj.custom': '{{#message}}'
  },
  rules: {
    cpf: {
      method(message?: string) {
        // biome-ignore lint/suspicious/noExplicitAny: joi's $_addRule is loosely typed
        return (this as any).$_addRule({ name: 'cpf', args: { message } })
      },
      args: [
        {
          name: 'message',
          ref: false,
          assert: (value: unknown) => value === undefined || typeof value === 'string',
          message: 'must be a string'
        }
      ],
      // biome-ignore lint/suspicious/noExplicitAny: helpers/args are untyped in joi extensions
      validate(value: unknown, helpers: any, args: { message?: string }) {
        if (cpf.isValid(value as string)) return value
        return args.message
          ? helpers.error('document.cpf.custom', { message: args.message })
          : helpers.error('document.cpf')
      }
    },
    cnpj: {
      method(message?: string) {
        // biome-ignore lint/suspicious/noExplicitAny: joi's $_addRule is loosely typed
        return (this as any).$_addRule({ name: 'cnpj', args: { message } })
      },
      args: [
        {
          name: 'message',
          ref: false,
          assert: (value: unknown) => value === undefined || typeof value === 'string',
          message: 'must be a string'
        }
      ],
      // biome-ignore lint/suspicious/noExplicitAny: helpers/args are untyped in joi extensions
      validate(value: unknown, helpers: any, args: { message?: string }) {
        if (cnpj.isValid(value as string)) return value
        return args.message
          ? helpers.error('document.cnpj.custom', { message: args.message })
          : helpers.error('document.cnpj')
      }
    }
  }
})
