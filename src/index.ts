/**
 * Biblioteca para validar, formatar e gerar CPF e CNPJ brasileiros,
 * com suporte ao novo formato alfanumérico de CNPJ da Receita Federal
 * (Nota Técnica 49/2024, vigência julho/2026).
 *
 * Adapters para bibliotecas de validação estão disponíveis via subpaths:
 * - `cpf-cnpj-validator/joi`
 * - `cpf-cnpj-validator/yup`
 * - `cpf-cnpj-validator/zod`
 * - `cpf-cnpj-validator/class-validator`
 *
 * @example
 * ```ts
 * import { cpf, cnpj } from 'cpf-cnpj-validator'
 *
 * cpf.isValid('295.379.955-93')   // true
 * cnpj.isValid('12ABC34501DE35')  // true (novo formato RFB)
 * cpf.generate({ state: 'SP' })   // CPF de São Paulo
 * ```
 *
 * @packageDocumentation
 */

import cnpj from './cnpj'
import cpf from './cpf'

export type { GenerateOptions as CnpjGenerateOptions } from './cnpj'
export type { GenerateOptions as CpfGenerateOptions, UF } from './cpf'
// Aliases pra evitar colisão com nomes de variáveis locais (#36):
//   import { cpf as cpfValidator } from 'cpf-cnpj-validator'  ← padrão antigo
//   import { cpfValidator } from 'cpf-cnpj-validator'         ← novo, semanticamente claro
export { cnpj, cnpj as cnpjValidator, cpf, cpf as cpfValidator }
