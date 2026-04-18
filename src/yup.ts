import type * as yup from 'yup'
import cnpj from './cnpj'
import cpf from './cpf'

declare module 'yup' {
  interface StringSchema {
    cpf(message?: string): this
    cnpj(message?: string): this
  }
}

export function yupValidator(yupInstance: typeof yup): void {
  yupInstance.addMethod(yupInstance.string, 'cpf', function cpfMethod(message = 'CPF inválido') {
    return this.test('cpf', message, (value) => !value || cpf.isValid(value))
  })

  yupInstance.addMethod(yupInstance.string, 'cnpj', function cnpjMethod(message = 'CNPJ inválido') {
    return this.test('cnpj', message, (value) => !value || cnpj.isValid(value))
  })
}
