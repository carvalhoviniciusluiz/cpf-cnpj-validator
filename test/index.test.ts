import { describe, expect, test } from 'vitest'
import { cnpj, cnpjValidator, cpf, cpfValidator } from '../src'

describe('barrel — index', () => {
  /**
   * SPECIFICATION: Export alias requisitado na issue #36 — resolve o
   *                problema de colisão com a variável `cpf` comumente
   *                usada em código (ex: `const cpf = req.body.cpf`).
   * BEHAVIOR: cpfValidator e cnpjValidator são a MESMA referência
   *           (não uma cópia) dos objetos cpf e cnpj.
   * INTENT: Documentar executavelmente que cpfValidator/cnpjValidator
   *         são aliases diretos, não wrappers — zero overhead.
   * @covers src/index.ts (exports)
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/issues/36
   */
  test('cpfValidator e cnpjValidator são aliases de cpf e cnpj', () => {
    expect(cpfValidator).toBe(cpf)
    expect(cnpjValidator).toBe(cnpj)
  })

  test('API pública expõe todos os métodos esperados', () => {
    expect(typeof cpf.isValid).toBe('function')
    expect(typeof cpf.format).toBe('function')
    expect(typeof cpf.strip).toBe('function')
    expect(typeof cpf.generate).toBe('function')
    expect(typeof cpf.verifierDigit).toBe('function')
    expect(typeof cnpj.isValid).toBe('function')
    expect(typeof cnpj.format).toBe('function')
    expect(typeof cnpj.strip).toBe('function')
    expect(typeof cnpj.generate).toBe('function')
    expect(typeof cnpj.verifierDigit).toBe('function')
  })
})
