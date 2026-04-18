import fc from 'fast-check'
import { describe, test } from 'vitest'
import { cnpj, cpf } from '../src'
import { FISCAL_REGION_BY_UF, type UF } from '../src/cpf'

// Property-based tests: fast-check gera centenas de entradas aleatórias
// e verifica invariantes — pega casos que testes unitários deixam passar.

describe('CPF — propriedades', () => {
  /**
   * SPECIFICATION: Invariante crítica da lib — gerar um CPF e depois
   *                validá-lo deve SEMPRE retornar true.
   * BEHAVIOR: Para qualquer número de chamadas, cpf.isValid(cpf.generate())
   *           é verdadeiro.
   * INTENT: Property-based test que pega regressões no algoritmo Módulo 11
   *         que escapariam de asserções fixas (ex: bugs que só aparecem
   *         em certos dígitos raros).
   * @covers src/cpf.ts generate, isValid, src/core/modulo11.ts cpfDigit
   */
  test('generate sempre produz CPF válido', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const value = cpf.generate()
        return cpf.isValid(value)
      }),
      { numRuns: 500 }
    )
  })

  test('generate(true) sempre produz CPF formatado e válido', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const value = cpf.generate(true)
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) && cpf.isValid(value)
      }),
      { numRuns: 500 }
    )
  })

  test('format e strip são inversas em CPFs válidos', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const raw = cpf.generate()
        return cpf.strip(cpf.format(raw)) === raw
      }),
      { numRuns: 500 }
    )
  })

  /**
   * SPECIFICATION: generate({ state: UF }) é determinístico na 9ª posição.
   * BEHAVIOR: Para qualquer UF, o CPF gerado tem o dígito da Região
   *           Fiscal correspondente na posição 9.
   * INTENT: Travar o contrato de codificação de UF contra regressões no
   *         mapa FISCAL_REGION_BY_UF.
   * @covers src/cpf.ts generate (branch com state)
   */
  test('generate({state}) codifica a UF na 9ª posição para qualquer UF', () => {
    const ufs = Object.keys(FISCAL_REGION_BY_UF) as UF[]
    fc.assert(
      fc.property(fc.constantFrom(...ufs), (state) => {
        const value = cpf.generate({ state })
        return value[8] === String(FISCAL_REGION_BY_UF[state])
      }),
      { numRuns: 200 }
    )
  })

  test('isValid retorna false para qualquer string com tamanho diferente de 11', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.replace(/[^\d]/g, '').length !== 11),
        (s) => !cpf.isValid(s)
      ),
      { numRuns: 500 }
    )
  })
})

describe('CNPJ — propriedades', () => {
  test('generate sempre produz CNPJ válido', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const value = cnpj.generate()
        return cnpj.isValid(value)
      }),
      { numRuns: 500 }
    )
  })

  test('generate(true) sempre produz CNPJ formatado e válido', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const value = cnpj.generate(true)
        return (
          /^[\dA-Z]{2}\.[\dA-Z]{3}\.[\dA-Z]{3}\/[\dA-Z]{4}-\d{2}$/.test(value) &&
          cnpj.isValid(value)
        )
      }),
      { numRuns: 500 }
    )
  })

  test('format e strip são inversas em CNPJs válidos', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const raw = cnpj.generate()
        return cnpj.strip(cnpj.format(raw)) === raw
      }),
      { numRuns: 500 }
    )
  })

  /**
   * SPECIFICATION: Modo loose é case-insensitive (normaliza via toUpperCase).
   * BEHAVIOR: Para qualquer CNPJ gerado (válido), isValid(raw) e
   *           isValid(raw.toLowerCase()) retornam o mesmo resultado em
   *           modo loose.
   * INTENT: Travar a normalização case-insensitive em loose contra
   *         regressões no strip(). Nota: a assimetria com strict é
   *         testada em cnpj.test.ts com um caso fixo, pois strict pode
   *         ter colisões de DV quando letras em posições de pesos
   *         complementares (w+w'=11) cancelam-se no mod 11.
   * @covers src/cnpj.ts strip (toUpperCase em loose)
   */
  test('loose é case-insensitive', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e9 }), () => {
        const raw = cnpj.generate()
        return cnpj.isValid(raw) === cnpj.isValid(raw.toLowerCase())
      }),
      { numRuns: 500 }
    )
  })

  test('isValid retorna false para qualquer string com tamanho diferente de 14', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.replace(/[^\dA-Za-z]/g, '').length !== 14),
        (s) => !cnpj.isValid(s)
      ),
      { numRuns: 500 }
    )
  })
})

describe('Módulo 11 — propriedades', () => {
  test('cpf.verifierDigit sempre retorna dígito 0..9', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: fc.constantFrom(...'0123456789'), minLength: 1, maxLength: 20 }),
        (digits) => {
          const dv = cpf.verifierDigit(digits)
          return Number.isInteger(dv) && dv >= 0 && dv <= 9
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('cnpj.verifierDigit sempre retorna dígito 0..9', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
          minLength: 1,
          maxLength: 20
        }),
        (digits) => {
          const dv = cnpj.verifierDigit(digits)
          return Number.isInteger(dv) && dv >= 0 && dv <= 9
        }
      ),
      { numRuns: 1000 }
    )
  })
})
