import 'reflect-metadata'
import { validate } from 'class-validator'
import { describe, expect, test } from 'vitest'
import { cnpj, cpf } from '../src'
import { IsCNPJ, IsCPF } from '../src/class-validator'

class CpfDTO {
  @IsCPF()
  value!: string
}

class CnpjDTO {
  @IsCNPJ()
  value!: string
}

class CpfCustomDTO {
  @IsCPF({ message: 'CPF precisa ser válido!' })
  value!: string
}

async function errorsOf<T extends object>(instance: T) {
  return validate(instance as object)
}

describe('class-validator adapter — CPF', () => {
  test('aceita CPF cru válido', async () => {
    const dto = new CpfDTO()
    dto.value = cpf.generate()
    expect(await errorsOf(dto)).toHaveLength(0)
  })

  test('aceita CPF formatado válido', async () => {
    const dto = new CpfDTO()
    dto.value = cpf.generate(true)
    expect(await errorsOf(dto)).toHaveLength(0)
  })

  test('rejeita CPF inválido com mensagem padrão', async () => {
    const dto = new CpfDTO()
    dto.value = '01283191283'
    const errors = await errorsOf(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.constraints?.IsCPF).toBe('CPF inválido')
  })

  test('permite mensagem customizada', async () => {
    const dto = new CpfCustomDTO()
    dto.value = '01283191283'
    const errors = await errorsOf(dto)
    expect(errors[0]?.constraints?.IsCPF).toBe('CPF precisa ser válido!')
  })

  test('rejeita valores não-string', async () => {
    const dto = new CpfDTO()
    dto.value = 29537995593 as unknown as string
    expect(await errorsOf(dto)).toHaveLength(1)
  })
})

describe('class-validator adapter — CNPJ', () => {
  test('aceita CNPJ cru válido', async () => {
    const dto = new CnpjDTO()
    dto.value = cnpj.generate()
    expect(await errorsOf(dto)).toHaveLength(0)
  })

  test('aceita CNPJ formatado válido', async () => {
    const dto = new CnpjDTO()
    dto.value = cnpj.generate(true)
    expect(await errorsOf(dto)).toHaveLength(0)
  })

  test('aceita CNPJ alfanumérico oficial da RFB', async () => {
    const dto = new CnpjDTO()
    dto.value = '12ABC34501DE35'
    expect(await errorsOf(dto)).toHaveLength(0)
  })

  test('rejeita CNPJ inválido', async () => {
    const dto = new CnpjDTO()
    dto.value = '0128319128312'
    const errors = await errorsOf(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.constraints?.IsCNPJ).toBe('CNPJ inválido')
  })
})
