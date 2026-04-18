import { describe, expect, test } from 'vitest'
import * as yup from 'yup'
import { cnpj, cpf } from '../src'
import { yupValidator } from '../src/yup'

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

  test('aceita CNPJ alfanumérico oficial da RFB', async () => {
    await expect(schema.validate('12ABC34501DE35')).resolves.toEqual('12ABC34501DE35')
  })

  test('rejeita CNPJ inválido', async () => {
    await expect(schema.validate('0128319128312')).rejects.toThrow('CNPJ inválido')
  })
})
