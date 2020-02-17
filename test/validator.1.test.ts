import 'jest'

import _joi from '@hapi/joi'
import validator, { cpf, cnpj } from '../src'

declare var require: any

const Joi = _joi.extend(validator)

describe('Test CPF', () => {
  const cpfSchema = Joi.document().cpf().required()

  test ('deve ser capaz de validar o CPF apenas como número', () => {
    const validCPF = cpf.generate()
    Joi.validate(validCPF, cpfSchema, (err: any, value: any) => {
      expect(err).toBeNull()
      expect(value).toEqual(validCPF)
    })
  })

  test ('deve ser capaz de validar o CPF como string com pontos e barras', () => {
    const validCPF = cpf.generate(true)
    Joi.validate(validCPF, cpfSchema, (err: any, value: any) => {
      expect(err).toBeNull()
      expect(value).toEqual(validCPF)
    })
  })

  test ('deve falhar no CPF inválido', () => {
    const cpf = '01283191283'
    Joi.validate(cpf, cpfSchema, (err: any, value: any) => {
      expect(err).toEqual(expect.anything())
      expect(value).toEqual(cpf)
    })
  })
})

describe('Test CNPJ', () => {
  const cnpjSchema = Joi.document().cnpj().required()

  test ('deve ser capaz de validar o CNPJ apenas como número', () => {
    const validCNPJ = cnpj.generate()
    Joi.validate(validCNPJ, cnpjSchema, (err: any, value: any) => {
      expect(err).toBeNull()
      expect(value).toEqual(validCNPJ)
    })
  })

  test ('deve ser capaz de validar o CNPJ como uma string com pontos e barras', () => {
    const validCNPJ = cnpj.generate(true)
    Joi.validate(validCNPJ, cnpjSchema, (err: any, value: any) => {
      expect(err).toBeNull()
      expect(value).toEqual(validCNPJ)
    })
  })

  test ('deve falhar no CNPJ inválido', () => {
    const cnpj = '0128319128312'
    Joi.validate(cnpj, cnpjSchema, (err: any, value: any) => {
      expect(err).toEqual(expect.anything())
      expect(value).toEqual(cnpj)
    })
  })
})
