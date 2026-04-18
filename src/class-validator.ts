import { registerDecorator, type ValidationOptions } from 'class-validator'
import cnpj from './cnpj'
import cpf from './cpf'

/**
 * Decorator de propriedade que valida um CPF via class-validator.
 * Padrão idiomático em NestJS + DTOs.
 *
 * Requer `reflect-metadata` importado no bootstrap da aplicação e as
 * flags `experimentalDecorators` + `emitDecoratorMetadata` no tsconfig.
 *
 * @param options - `ValidationOptions` padrão do class-validator
 *   (message, each, groups, always, context).
 *
 * @example
 * ```ts
 * import 'reflect-metadata'
 * import { IsCPF } from 'cpf-cnpj-validator/class-validator'
 *
 * class UserDTO {
 *   @IsCPF({ message: 'CPF deve ser válido' })
 *   cpf!: string
 * }
 * ```
 */
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

/**
 * Decorator de propriedade que valida um CNPJ via class-validator.
 * Aceita tanto CNPJs numéricos legados quanto o novo formato
 * alfanumérico da Nota Técnica RFB 49/2024.
 *
 * Requer `reflect-metadata` importado no bootstrap da aplicação e as
 * flags `experimentalDecorators` + `emitDecoratorMetadata` no tsconfig.
 *
 * @param options - `ValidationOptions` padrão do class-validator.
 *
 * @example
 * ```ts
 * import 'reflect-metadata'
 * import { IsCNPJ } from 'cpf-cnpj-validator/class-validator'
 *
 * class CompanyDTO {
 *   @IsCNPJ()
 *   cnpj!: string  // aceita '12.ABC.345/01DE-35'
 * }
 * ```
 */
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
