import type * as yup from 'yup'
import cnpj from './cnpj'
import cpf from './cpf'

declare module 'yup' {
  interface StringSchema {
    /** Valida se a string é um CPF válido. */
    cpf(message?: string): this
    /**
     * Valida se a string é um CNPJ válido (aceita o novo formato
     * alfanumérico da Nota Técnica RFB 49/2024).
     */
    cnpj(message?: string): this
  }
}

/**
 * Estende o yup com os métodos `.cpf()` e `.cnpj()` em `yup.string()`.
 * Deve ser chamado uma única vez no bootstrap da aplicação.
 *
 * @param yupInstance - Namespace do yup importado como `import * as yup from 'yup'`.
 *
 * @example
 * ```ts
 * import * as yup from 'yup'
 * import { yupValidator } from 'cpf-cnpj-validator/yup'
 *
 * yupValidator(yup)
 * const schema = yup.string().cpf().required()
 * await schema.validate('295.379.955-93') // OK
 * ```
 */
export function yupValidator(yupInstance: typeof yup): void {
  yupInstance.addMethod(yupInstance.string, 'cpf', function cpfMethod(message = 'CPF inválido') {
    return this.test('cpf', message, (value) => !value || cpf.isValid(value))
  })

  yupInstance.addMethod(yupInstance.string, 'cnpj', function cnpjMethod(message = 'CNPJ inválido') {
    return this.test('cnpj', message, (value) => !value || cnpj.isValid(value))
  })
}
