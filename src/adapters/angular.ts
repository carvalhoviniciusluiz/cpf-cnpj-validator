import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import cnpj from '../cnpj'
import cpf from '../cpf'

/**
 * Cria um `ValidatorFn` do Angular Reactive Forms que valida CPF.
 * Retorna `null` quando o valor é vazio (delegando a obrigatoriedade
 * ao `Validators.required`) ou quando o CPF é válido; retorna
 * `{ cpf: <valor> }` caso contrário.
 *
 * @example
 * ```ts
 * import { cpfValidator } from 'cpf-cnpj-validator/angular'
 *
 * new FormGroup({
 *   cpf: new FormControl('', [Validators.required, cpfValidator()])
 * })
 * ```
 */
export const cpfValidator =
  (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null | undefined
    return !value || cpf.isValid(value) ? null : { cpf: value }
  }

/**
 * Cria um `ValidatorFn` do Angular Reactive Forms que valida CNPJ,
 * aceitando tanto o formato numérico legado quanto o novo alfanumérico
 * da Nota Técnica RFB 49/2024.
 *
 * @example
 * ```ts
 * import { cnpjValidator } from 'cpf-cnpj-validator/angular'
 *
 * new FormControl('', [cnpjValidator()])
 * // aceita '12.ABC.345/01DE-35'
 * ```
 */
export const cnpjValidator =
  (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null | undefined
    return !value || cnpj.isValid(value) ? null : { cnpj: value }
  }

/**
 * API legada estilo classe, compatível com a proposta original da PR #21
 * do @rodzappa. Permite usar diretamente como validador no array de
 * Validators sem invocar factory:
 *
 * @example
 * ```ts
 * import { AngularValidator } from 'cpf-cnpj-validator/angular'
 *
 * new FormControl('', [AngularValidator.cpf, AngularValidator.cnpj])
 * ```
 */
// biome-ignore lint/complexity/noStaticOnlyClass: mantém compat com API estática da PR #21
export class AngularValidator {
  static cpf: ValidatorFn = cpfValidator()
  static cnpj: ValidatorFn = cnpjValidator()
}
