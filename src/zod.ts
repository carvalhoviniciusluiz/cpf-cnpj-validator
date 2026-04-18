import type { z as ZodNamespace } from 'zod'
import cnpj from './cnpj'
import cpf from './cpf'

export function zodValidator(z: typeof ZodNamespace) {
  return {
    cpf: (message = 'CPF inválido') =>
      z.string().refine((value) => cpf.isValid(value), { message }),
    cnpj: (message = 'CNPJ inválido') =>
      z.string().refine((value) => cnpj.isValid(value), { message })
  }
}
