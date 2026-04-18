import _joi from 'joi'
import { describe, expect, test } from 'vitest'
import { cnpj, cpf } from '../src'
import { joiValidator } from '../src/adapters/joi'

const Joi = _joi.extend(joiValidator)

describe('joi adapter — CPF', () => {
  const schema = Joi.document().cpf().required()

  test('aceita CPF cru válido', async () => {
    const value = cpf.generate()
    await expect(schema.validateAsync(value)).resolves.toEqual(value)
  })

  test('aceita CPF formatado válido', async () => {
    const value = cpf.generate(true)
    await expect(schema.validateAsync(value)).resolves.toEqual(value)
  })

  /**
   * SPECIFICATION: Contrato do adapter joi — quando um valor inválido é
   *                submetido ao schema, joi rejeita a Promise com
   *                error.details[0] contendo type='document.cpf' e
   *                message='CPF inválido'.
   * BEHAVIOR: validateAsync('01283191283') rejeita com estrutura
   *           completa do erro (type, path, context.label, context.value).
   * INTENT: Proteger o formato exato do erro que consumidores do joi
   *         usam para tratamento (ex: switch no err.details[0].type
   *         para roteamento de mensagens i18n). Mudança no shape do
   *         erro = breaking change para usuários da API.
   * FLOW: joi.extend(joiValidator) → Joi.document().cpf() → validateAsync
   *       → cpf.isValid(value) retorna false → helpers.error('document.cpf')
   *       → joi monta o ValidationError.
   * @covers src/joi.ts joiValidator, messages, rules.cpf
   */
  test('rejeita CPF inválido com erro document.cpf', async () => {
    await expect(schema.validateAsync('01283191283')).rejects.toMatchObject({
      details: [
        {
          message: 'CPF inválido',
          path: [],
          type: 'document.cpf',
          context: { label: 'value', value: '01283191283' }
        }
      ]
    })
  })
})

describe('joi adapter — CNPJ', () => {
  const schema = Joi.document().cnpj().required()

  test('aceita CNPJ cru válido', async () => {
    const value = cnpj.generate()
    await expect(schema.validateAsync(value)).resolves.toEqual(value)
  })

  test('aceita CNPJ formatado válido', async () => {
    const value = cnpj.generate(true)
    await expect(schema.validateAsync(value)).resolves.toEqual(value)
  })

  /**
   * SPECIFICATION: O adapter joi deve propagar o suporte alfanumérico do
   *                cnpj.isValid para o schema Joi.document().cnpj().
   * BEHAVIOR: validateAsync('12ABC34501DE35') resolve com o próprio
   *           valor (vetor oficial da RFB — pergunta 14 do PDF).
   * INTENT: Garantir que integrações joi existentes passam a aceitar
   *         CNPJs alfanuméricos na v2 "de graça", sem alteração no
   *         código do consumidor além do upgrade da lib.
   * FLOW: schema.validateAsync → joiValidator.rules.cnpj.validate →
   *       cnpj.isValid('12ABC34501DE35') → true → retorna value.
   * @covers src/joi.ts joiValidator rules.cnpj
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/45
   */
  test('aceita CNPJ alfanumérico oficial da RFB', async () => {
    await expect(schema.validateAsync('12ABC34501DE35')).resolves.toEqual('12ABC34501DE35')
  })

  test('rejeita CNPJ inválido com erro document.cnpj', async () => {
    await expect(schema.validateAsync('0128319128312')).rejects.toMatchObject({
      details: [
        {
          message: 'CNPJ inválido',
          path: [],
          type: 'document.cnpj',
          context: { label: 'value', value: '0128319128312' }
        }
      ]
    })
  })

  /**
   * SPECIFICATION: Contrato do adapter joi — joi.document().cpf(message?)
   *                e joi.document().cnpj(message?) aceitam mensagem
   *                customizada inline, alinhando com o padrão dos
   *                adapters yup, zod e class-validator.
   * BEHAVIOR: Quando uma mensagem é passada, o erro retornado pelo joi
   *           tem .message === mensagem informada (em vez do padrão
   *           'CPF inválido' / 'CNPJ inválido').
   * INTENT: Fechar a issue #32 mantendo API consistente entre os 4
   *         adapters. Usa template {{#message}} via error code
   *         document.{cpf,cnpj}.custom quando arg é passado.
   * @covers src/adapters/joi.ts (rules.cpf/cnpj method + args)
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/issues/32
   */
  test('permite mensagem customizada inline no método', async () => {
    const cpfCustom = Joi.document().cpf('CPF precisa ser válido!').required()
    await expect(cpfCustom.validateAsync('01283191283')).rejects.toThrow('CPF precisa ser válido!')

    const cnpjCustom = Joi.document().cnpj('CNPJ obrigatório').required()
    await expect(cnpjCustom.validateAsync('0128319128312')).rejects.toThrow('CNPJ obrigatório')
  })
})
