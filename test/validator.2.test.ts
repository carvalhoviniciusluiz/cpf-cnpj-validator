import 'jest'

import _joi  from 'joi'
import { validator, cpf, cnpj } from '../src'

const Joi = _joi.extend(validator)

describe('Test CPF', () => {
  const cpfSchema = Joi.document().cpf().required()

  test ('deve ser capaz de validar o CPF apenas como número', async () => {
    const validCPF = cpf.generate()
    const value = await cpfSchema.validateAsync(validCPF)

    expect(value).toEqual(validCPF)
  })

  test ('deve ser capaz de validar o CPF como string com pontos e barras', async () => {
    const validCPF = cpf.generate(true)
    const value = await cpfSchema.validateAsync(validCPF)

    expect(value).toEqual(validCPF)
  })

  test ('deve falhar no CPF inválido', async () => {
    expect.assertions(1)
    const cpf = '01283191283'
    try {
      await cpfSchema.validateAsync(cpf)
    } catch (error) {
      expect(error.details).toEqual([{
        message: 'CPF inválido',
        path: [],
        type: 'document.cpf',
        context: { label: 'value', value: '01283191283' }
      }])
    }
  })
})

describe('Test CNPJ', () => {
  const cnpjSchema = Joi.document().cnpj().required()

  test ('deve ser capaz de validar o CNPJ apenas como número', async () => {
    const validCNPJ = cnpj.generate()
    const value = await cnpjSchema.validateAsync(validCNPJ)

    expect(value).toEqual(validCNPJ)
  })

  test ('deve ser capaz de validar o CNPJ como uma string com pontos e barras', async () => {
    const validCNPJ = cnpj.generate(true)
    const value = await cnpjSchema.validateAsync(validCNPJ)
    expect(value).toEqual(validCNPJ)
  })

  test ('deve falhar no CNPJ inválido', async () => {
    expect.assertions(1)
    const cnpj = '0128319128312'
    try {
      await cnpjSchema.validateAsync(cnpj)
    } catch (error) {
      expect(error.details).toEqual([{
        message: 'CNPJ inválido',
        path: [],
        type: 'document.cnpj',
        context: { label: 'value', value: '0128319128312' }
      }])
    }
  })

  test ('deve aceitar CNPJ alfanumérico oficial da RFB', async () => {
    const value = await cnpjSchema.validateAsync('12ABC34501DE35')
    expect(value).toEqual('12ABC34501DE35')
  })
})
