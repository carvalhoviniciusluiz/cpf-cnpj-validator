import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { cnpj, cpf } from '../src'
import { zodValidator } from '../src/zod'

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

  test('aceita CNPJ alfanumérico oficial da RFB', () => {
    expect(zCnpj().parse('12ABC34501DE35')).toEqual('12ABC34501DE35')
  })

  test('rejeita CNPJ inválido', () => {
    expect(zCnpj().safeParse('0128319128312').success).toBe(false)
  })
})
