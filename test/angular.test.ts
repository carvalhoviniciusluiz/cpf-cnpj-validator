import type { AbstractControl } from '@angular/forms'
import { describe, expect, test } from 'vitest'
import { AngularValidator, cnpjValidator, cpfValidator } from '../src/adapters/angular'

// Stub mínimo de AbstractControl — os ValidatorFn só leem .value, então
// não precisamos instanciar Angular TestBed nem FormControl reais.
const ctrl = (value: unknown) => ({ value }) as AbstractControl

describe('angular adapter — cpfValidator', () => {
  /**
   * SPECIFICATION: Contrato do Angular Reactive Forms — ValidatorFn retorna
   *                null quando válido, ou ValidationErrors com uma chave
   *                indicando o tipo do erro quando inválido.
   * BEHAVIOR: cpfValidator() retorna null pra CPFs válidos (cru/formatado/loose)
   *           e { cpf: <value> } pra inválidos.
   * INTENT: Travar o formato do retorno pra que templates Angular possam usar
   *         [ngControl.errors?.cpf] diretamente.
   * @covers src/adapters/angular.ts cpfValidator
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21
   */
  test('retorna null para CPF válido', () => {
    expect(cpfValidator()(ctrl('295.379.955-93'))).toBeNull()
    expect(cpfValidator()(ctrl('29537995593'))).toBeNull()
  })

  test('retorna { cpf: value } para CPF inválido', () => {
    expect(cpfValidator()(ctrl('01283191283'))).toEqual({ cpf: '01283191283' })
  })

  test('retorna null quando value é vazio (delega a required)', () => {
    expect(cpfValidator()(ctrl(''))).toBeNull()
    expect(cpfValidator()(ctrl(null))).toBeNull()
    expect(cpfValidator()(ctrl(undefined))).toBeNull()
  })
})

describe('angular adapter — cnpjValidator', () => {
  test('retorna null para CNPJ numérico válido', () => {
    expect(cnpjValidator()(ctrl('54.550.752/0001-55'))).toBeNull()
    expect(cnpjValidator()(ctrl('54550752000155'))).toBeNull()
  })

  /**
   * SPECIFICATION: O adapter Angular deve herdar o suporte alfanumérico
   *                do core cnpj.isValid — sem config adicional.
   * BEHAVIOR: Dado o vetor oficial '12ABC34501DE35', o validador retorna null.
   * INTENT: Travar que aplicações Angular passam a aceitar CNPJs alfanuméricos
   *         da RFB (jul/2026) automaticamente com o upgrade da lib pra v2.1.
   * @covers src/adapters/angular.ts cnpjValidator
   */
  test('aceita CNPJ alfanumérico oficial da RFB', () => {
    expect(cnpjValidator()(ctrl('12ABC34501DE35'))).toBeNull()
    expect(cnpjValidator()(ctrl('12.ABC.345/01DE-35'))).toBeNull()
  })

  test('retorna { cnpj: value } para CNPJ inválido', () => {
    expect(cnpjValidator()(ctrl('0128319128312'))).toEqual({ cnpj: '0128319128312' })
  })

  test('retorna null quando value é vazio', () => {
    expect(cnpjValidator()(ctrl(''))).toBeNull()
    expect(cnpjValidator()(ctrl(null))).toBeNull()
  })
})

describe('angular adapter — AngularValidator (classe legada, estilo PR #21)', () => {
  /**
   * SPECIFICATION: Compatibilidade com a API proposta em 2020 pela PR #21
   *                do @rodzappa — permite usar a classe estática direto no
   *                array de Validators, sem invocar factory.
   * BEHAVIOR: AngularValidator.cpf e AngularValidator.cnpj têm o mesmo
   *           comportamento dos ValidatorFns retornados pelos factories.
   * INTENT: Fechar o gap de 6 anos mantendo a interface sugerida pelo
   *         contribuidor original, agora dentro da arquitetura de peer
   *         deps opcionais que a v2 introduziu.
   * @covers src/adapters/angular.ts AngularValidator
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21
   */
  test('AngularValidator.cpf funciona como ValidatorFn direto', () => {
    expect(AngularValidator.cpf(ctrl('29537995593'))).toBeNull()
    expect(AngularValidator.cpf(ctrl('01283191283'))).toEqual({ cpf: '01283191283' })
  })

  test('AngularValidator.cnpj funciona como ValidatorFn direto', () => {
    expect(AngularValidator.cnpj(ctrl('54550752000155'))).toBeNull()
    expect(AngularValidator.cnpj(ctrl('12ABC34501DE35'))).toBeNull()
    expect(AngularValidator.cnpj(ctrl('0128319128312'))).toEqual({ cnpj: '0128319128312' })
  })
})
