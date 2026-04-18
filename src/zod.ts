import type { z as ZodNamespace } from 'zod'
import cnpj from './cnpj'
import cpf from './cpf'

/**
 * Cria factories zod para CPF e CNPJ. Como zod não usa mutation pattern
 * (diferente de joi/yup), passamos o namespace `z` e retornamos as
 * factories prontas pra usar.
 *
 * @param z - Namespace do zod (importado como `import { z } from 'zod'`).
 * @returns Objeto com `cpf(message?)` e `cnpj(message?)` retornando
 *   schemas zod de string.
 *
 * @example
 * ```ts
 * import { z } from 'zod'
 * import { zodValidator } from 'cpf-cnpj-validator/zod'
 *
 * const { cpf: zCpf, cnpj: zCnpj } = zodValidator(z)
 *
 * const User = z.object({
 *   cpf: zCpf(),
 *   cnpj: zCnpj('CNPJ é obrigatório e válido').optional()
 * })
 * ```
 */
export function zodValidator(z: typeof ZodNamespace) {
  return {
    cpf: (message = 'CPF inválido') =>
      z.string().refine((value) => cpf.isValid(value), { message }),
    cnpj: (message = 'CNPJ inválido') =>
      z.string().refine((value) => cnpj.isValid(value), { message })
  }
}
