import 'jest'

import { cnpj } from '../src'

describe('CNPJ', () => {
  test ('números de listas negras', () => {
    expect(cnpj.isValid('00000000000000')).toBeFalsy()
    expect(cnpj.isValid('11111111111111')).toBeFalsy()
    expect(cnpj.isValid('22222222222222')).toBeFalsy()
    expect(cnpj.isValid('33333333333333')).toBeFalsy()
    expect(cnpj.isValid('44444444444444')).toBeFalsy()
    expect(cnpj.isValid('55555555555555')).toBeFalsy()
    expect(cnpj.isValid('66666666666666')).toBeFalsy()
    expect(cnpj.isValid('77777777777777')).toBeFalsy()
    expect(cnpj.isValid('88888888888888')).toBeFalsy()
    expect(cnpj.isValid('99999999999999')).toBeFalsy()
  })

  test ('rejeita valores falsos', () => {
    expect(cnpj.isValid('')).toBeFalsy()
    expect(cnpj.isValid(null)).toBeFalsy()
    expect(cnpj.isValid(undefined)).toBeFalsy()
  })

  test ('valida strings formatadas', () => {
    expect(cnpj.isValid('54.550.752/0001-55')).toBeTruthy()
  })

  test ('valida strings não formatadas', () => {
    expect(cnpj.isValid('54550752000155')).toBeTruthy()
  })

  test ('valida strings confusas', () => {
    expect(cnpj.isValid('54550[752#0001..$55')).toBeTruthy()
  })

  test ('valida cadeias de caracteres', () => {
    expect(cnpj.isValid('54550[752#0001..$55', true)).toBeFalsy()
    expect(cnpj.isValid('54.550.752/0001-55', true)).toBeTruthy()
    expect(cnpj.isValid('54550752000155', true)).toBeTruthy()
  })

  test ('retorna número não formatado', () => {
    var number = cnpj.strip('54550[752#0001..$55')
    expect(number).toEqual('54550752000155')
  })

  test ('retorna número formatado', () => {
    var number = cnpj.format('54550752000155')
    expect(number).toEqual('54.550.752/0001-55')
  })

  test ('gera número formatado', () => {
    var number = cnpj.generate(true)

    expect(number).toMatch(/^([\dA-Z]{2}).([\dA-Z]{3}).([\dA-Z]{3})\/([\dA-Z]{4})-(\d{2})$/)
    expect(cnpj.isValid(number)).toBeTruthy()
  })

  test ('gera número não formatado', () => {
    var number = cnpj.generate()

    expect(number).toMatch(/^([\dA-Z]{2})([\dA-Z]{3})([\dA-Z]{3})([\dA-Z]{4})(\d{2})$/)
    expect(cnpj.isValid(number)).toBeTruthy()
  })
})
