import { describe, expect, test } from 'vitest'
import * as yup from 'yup'
import { cnpj, cpf } from '../src'
import { yupValidator } from '../src/adapters/yup'

yupValidator(yup)

describe('yup adapter — CPF', () => {
  const schema = yup.string().cpf().required()

  test('aceita CPF cru válido', async () => {
    const value = cpf.generate()
    await expect(schema.validate(value)).resolves.toEqual(value)
  })

  test('aceita CPF formatado válido', async () => {
    const value = cpf.generate(true)
    await expect(schema.validate(value)).resolves.toEqual(value)
  })

  test('rejeita CPF inválido com mensagem padrão', async () => {
    await expect(schema.validate('01283191283')).rejects.toThrow('CPF inválido')
  })

  /**
   * SPECIFICATION: Contrato do adapter yup — o método .cpf(message?)
   *                aceita mensagem opcional e a propaga como
   *                yup.ValidationError.message.
   * BEHAVIOR: yup.string().cpf('CPF precisa ser válido!') gera erro
   *           com exatamente essa mensagem ao validar um CPF inválido.
   * INTENT: Travar a API de personalização de mensagens — essencial
   *         para i18n e UX em formulários que usam yup como schema
   *         de form (padrão Formik, react-hook-form + yup resolver).
   * FLOW: yup.string().cpf(msg) → addMethod chamando this.test('cpf',
   *       msg, predicate) → predicate retorna false → yup lança
   *       ValidationError com a message.
   * @covers src/yup.ts yupValidator (addMethod 'cpf')
   */
  test('permite mensagem customizada', async () => {
    const customSchema = yup.string().cpf('CPF precisa ser válido!').required()
    await expect(customSchema.validate('01283191283')).rejects.toThrow('CPF precisa ser válido!')
  })
})

describe('yup adapter — CNPJ', () => {
  const schema = yup.string().cnpj().required()

  test('aceita CNPJ cru válido', async () => {
    const value = cnpj.generate()
    await expect(schema.validate(value)).resolves.toEqual(value)
  })

  test('aceita CNPJ formatado válido', async () => {
    const value = cnpj.generate(true)
    await expect(schema.validate(value)).resolves.toEqual(value)
  })

  /**
   * SPECIFICATION: O adapter yup deve propagar o suporte alfanumérico do
   *                cnpj.isValid para o método yup.string().cnpj().
   * BEHAVIOR: schema.validate('12ABC34501DE35') resolve com o próprio
   *           valor (vetor oficial da RFB — pergunta 14 do PDF).
   * INTENT: Paridade com joi/zod/class-validator — schemas yup
   *         existentes passam a aceitar CNPJs alfanuméricos na v2 sem
   *         alteração no consumidor.
   * @covers src/yup.ts yupValidator (addMethod 'cnpj')
   */
  test('aceita CNPJ alfanumérico oficial da RFB', async () => {
    await expect(schema.validate('12ABC34501DE35')).resolves.toEqual('12ABC34501DE35')
  })

  test('rejeita CNPJ inválido', async () => {
    await expect(schema.validate('0128319128312')).rejects.toThrow('CNPJ inválido')
  })
})
