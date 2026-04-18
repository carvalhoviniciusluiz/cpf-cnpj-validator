import { registerDecorator, type ValidationOptions } from 'class-validator'
import cnpj from './cnpj'
import cpf from './cpf'

export function IsCPF(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'IsCPF',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: 'CPF inválido', ...options },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && cpf.isValid(value)
        }
      }
    })
  }
}

export function IsCNPJ(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'IsCNPJ',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: 'CNPJ inválido', ...options },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && cnpj.isValid(value)
        }
      }
    })
  }
}
