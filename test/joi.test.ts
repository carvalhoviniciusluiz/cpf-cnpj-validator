import _joi from 'joi'
import { describe, expect, test } from 'vitest'
import { cnpj, cpf } from '../src'
import { joiValidator } from '../src/joi'

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
})
