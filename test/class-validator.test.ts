import 'reflect-metadata'
import { validate } from 'class-validator'
import { describe, expect, test } from 'vitest'
import { cnpj, cpf } from '../src'
import { IsCNPJ, IsCPF } from '../src/adapters/class-validator'

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

  /**
   * SPECIFICATION: @IsCPF(options) aceita ValidationOptions do
   *                class-validator, incluindo { message } que é propagada
   *                para errors[].constraints.IsCPF.
   * BEHAVIOR: DTO decorado com @IsCPF({ message: 'CPF precisa ser válido!' })
   *           gera erro cujo constraints.IsCPF === 'CPF precisa ser válido!'.
   * INTENT: Travar a API de personalização via decorator — padrão do
   *         ecossistema NestJS e essencial para i18n (class-validator
   *         é a forma idiomática de validar DTOs no Nest).
   * FLOW: @IsCPF({message}) → registerDecorator com options.message →
   *       validator.validate retorna false → class-validator monta
   *       ValidationError com constraints.IsCPF = message.
   * @covers src/class-validator.ts IsCPF (ValidationOptions)
   */
  test('permite mensagem customizada', async () => {
    const dto = new CpfCustomDTO()
    dto.value = '01283191283'
    const errors = await errorsOf(dto)
    expect(errors[0]?.constraints?.IsCPF).toBe('CPF precisa ser válido!')
  })

  /**
   * SPECIFICATION: Decorator valida apenas strings — números, null,
   *                undefined e objetos são rejeitados antes mesmo de
   *                chamar cpf.isValid.
   * BEHAVIOR: @IsCPF() + value=29537995593 (number literal) gera
   *           exatamente 1 erro.
   * INTENT: Documentar a defesa type-guard dentro do decorator. Evita
   *         que NestJS pipes com class-transformer (ex: @Type(() => Number)
   *         acidental) coercione números em strings silenciosamente e
   *         passem pela validação.
   * FLOW: validator.validate(value) → typeof value !== 'string' →
   *       retorna false → 1 erro.
   * @covers src/class-validator.ts IsCPF validator.validate
   */
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

  /**
   * SPECIFICATION: O decorator @IsCNPJ deve propagar o suporte
   *                alfanumérico do cnpj.isValid para DTOs decorados.
   * BEHAVIOR: DTO com @IsCNPJ + value='12ABC34501DE35' → validate()
   *           retorna lista vazia de erros.
   * INTENT: Paridade com joi/yup/zod — projetos NestJS existentes
   *         passam a aceitar CNPJs alfanuméricos na v2 sem alterar os
   *         DTOs (só requer upgrade da lib).
   * @covers src/class-validator.ts IsCNPJ
   */
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
