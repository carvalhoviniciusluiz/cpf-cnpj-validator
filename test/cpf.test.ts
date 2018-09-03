import 'jest'

import * as cpf from '../src/cpf'

describe('CPF', () => {
  test ('números de listas negras', () => {
    expect(cpf.isValid('00000000000')).toBeFalsy()
    expect(cpf.isValid('11111111111')).toBeFalsy()
    expect(cpf.isValid('22222222222')).toBeFalsy()
    expect(cpf.isValid('33333333333')).toBeFalsy()
    expect(cpf.isValid('44444444444')).toBeFalsy()
    expect(cpf.isValid('55555555555')).toBeFalsy()
    expect(cpf.isValid('66666666666')).toBeFalsy()
    expect(cpf.isValid('77777777777')).toBeFalsy()
    expect(cpf.isValid('88888888888')).toBeFalsy()
    expect(cpf.isValid('99999999999')).toBeFalsy()
    expect(cpf.isValid('12345678909')).toBeFalsy()
  })

  test ('rejeita valores falsos', () => {
    expect(cpf.isValid('')).toBeFalsy()
    expect(cpf.isValid(null)).toBeFalsy()
    expect(cpf.isValid(undefined)).toBeFalsy()
  })

  test ('valida strings formatadas', () => {
    expect(cpf.isValid('295.379.955-93')).toBeTruthy()
  })

  test ('valida strings não formatadas', () => {
    expect(cpf.isValid('29537995593')).toBeTruthy()
  })

  test ('valida strings de caracteres confusas', () => {
    expect(cpf.isValid('295$379\n955...93')).toBeTruthy()
  })

  test ('valida cadeias de caracteres', () => {
    expect(cpf.isValid('295$379\n955...93', true)).toBeFalsy()
    expect(cpf.isValid('295.379.955-93', true)).toBeTruthy()
    expect(cpf.isValid('29537995593', true)).toBeTruthy()
  })

  test ('retorna o número não formatado', () => {
    const number = cpf.strip('295.379.955-93')
    expect(number).toEqual('29537995593')
  })

  test ('retorna o número formatador', () => {
    const number = cpf.format('29537995593')
    expect(number).toEqual('295.379.955-93')
  })

  test ('gera número formatado', () => {
    const number = cpf.generate(true)

    expect(number).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })

  test ('gera número não formatado', () => {
    const number = cpf.generate()

    expect(number).toMatch(/^\d{3}\d{3}\d{3}\d{2}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })
})
