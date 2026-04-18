import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { cnpj, cpf } from '../src'
import { zodValidator } from '../src/adapters/zod'

const { cpf: zCpf, cnpj: zCnpj } = zodValidator(z)

describe('zod adapter — CPF', () => {
  test('aceita CPF cru válido', () => {
    const value = cpf.generate()
    expect(zCpf().parse(value)).toEqual(value)
  })

  test('aceita CPF formatado válido', () => {
    const value = cpf.generate(true)
    expect(zCpf().parse(value)).toEqual(value)
  })

  test('rejeita CPF inválido com mensagem padrão', () => {
    const result = zCpf().safeParse('01283191283')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('CPF inválido')
    }
  })

  /**
   * SPECIFICATION: Contrato do adapter zod — zCpf(message?) aceita
   *                mensagem opcional via z.string().refine({ message }).
   * BEHAVIOR: zCpf('CPF precisa ser válido!').safeParse(invalid) retorna
   *           { success: false, error: { issues: [{ message: '...' }] } }.
   * INTENT: Travar a API de personalização de mensagens no padrão zod
   *         (issues[].message) — essencial para i18n e integração com
   *         react-hook-form resolver do zod.
   * FLOW: zodValidator(z).cpf(msg) → z.string().refine(predicate,
   *       { message: msg }) → safeParse retorna ZodError com
   *       issues[0].message = msg quando predicate falha.
   * @covers src/zod.ts zodValidator.cpf
   */
  test('permite mensagem customizada', () => {
    const result = zCpf('CPF precisa ser válido!').safeParse('01283191283')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('CPF precisa ser válido!')
    }
  })
})

describe('zod adapter — CNPJ', () => {
  test('aceita CNPJ cru válido', () => {
    const value = cnpj.generate()
    expect(zCnpj().parse(value)).toEqual(value)
  })

  test('aceita CNPJ formatado válido', () => {
    const value = cnpj.generate(true)
    expect(zCnpj().parse(value)).toEqual(value)
  })

  /**
   * SPECIFICATION: O adapter zod deve propagar o suporte alfanumérico do
   *                cnpj.isValid para zodValidator(z).cnpj().
   * BEHAVIOR: zCnpj().parse('12ABC34501DE35') retorna o próprio valor
   *           (vetor oficial da RFB — pergunta 14 do PDF).
   * INTENT: Paridade com joi/yup/class-validator — schemas zod
   *         existentes passam a aceitar CNPJs alfanuméricos na v2 sem
   *         alteração no consumidor.
   * @covers src/zod.ts zodValidator.cnpj
   */
  test('aceita CNPJ alfanumérico oficial da RFB', () => {
    expect(zCnpj().parse('12ABC34501DE35')).toEqual('12ABC34501DE35')
  })

  test('rejeita CNPJ inválido', () => {
    expect(zCnpj().safeParse('0128319128312').success).toBe(false)
  })
})
