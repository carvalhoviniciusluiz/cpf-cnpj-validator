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

  test ('valida CNPJ alfanumérico oficial da Receita Federal', () => {
    // Vetor oficial — Nota Técnica RFB, pergunta 14: CNPJ 12.ABC.345/01DE-35 (DV1=3, DV2=5)
    expect(cnpj.isValid('12ABC34501DE35')).toBeTruthy()
    expect(cnpj.isValid('12.ABC.345/01DE-35')).toBeTruthy()
    expect(cnpj.verifierDigit('12ABC34501DE')).toBe(3)
    expect(cnpj.verifierDigit('12ABC34501DE3')).toBe(5)
  })

  test ('valida exemplos alfanuméricos de raiz/filial da RFB', () => {
    // PDF oficial — pergunta 23 (combinações raiz numérica/alfanumérica x filial)
    expect(cnpj.isValid('AA345678000114')).toBeTruthy()
    expect(cnpj.isValid('AA345678000A29')).toBeTruthy()
    expect(cnpj.isValid('12345678000A08')).toBeTruthy()
  })

  test ('rejeita CNPJ alfanumérico com dígito verificador alfabético', () => {
    // DVs (últimas 2 posições) permanecem sempre numéricos pela regra da RFB
    expect(cnpj.isValid('12ABC34501DE3A')).toBeFalsy()
  })

  test ('rejeita CNPJ alfanumérico em letras minúsculas', () => {
    // RFB emite identificadores apenas com letras maiúsculas (A-Z)
    expect(cnpj.isValid('12abc34501de35')).toBeFalsy()
  })

  test ('rejeita CNPJ com dígito verificador inválido', () => {
    expect(cnpj.isValid('54550752000154')).toBeFalsy()
    expect(cnpj.isValid('54550752000156')).toBeFalsy()
  })

  test ('rejeita CNPJ com tamanho incorreto', () => {
    expect(cnpj.isValid('1')).toBeFalsy()
    expect(cnpj.isValid('5455075200015')).toBeFalsy()
    expect(cnpj.isValid('545507520001555')).toBeFalsy()
  })

  test ('calcula verifierDigit corretamente para CNPJ numérico', () => {
    expect(cnpj.verifierDigit('545507520001')).toBe(5)
    expect(cnpj.verifierDigit('5455075200015')).toBe(5)
  })

  test ('strip em modo strict remove apenas pontos, barras e hífens', () => {
    expect(cnpj.strip('54.550.752/0001-55', true)).toEqual('54550752000155')
    expect(cnpj.strip('54550[752#0001..$55', true)).toEqual('54550[752#0001$55')
  })

  test ('formata CNPJ alfanumérico com a máscara oficial', () => {
    expect(cnpj.format('12ABC34501DE35')).toEqual('12.ABC.345/01DE-35')
  })
})
