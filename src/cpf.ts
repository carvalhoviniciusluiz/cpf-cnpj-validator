import { cpfDigit as verifierDigit } from './core/modulo11'

const BLACKLIST = new Set<string>([
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12345678909'
])

const STRICT_STRIP_REGEX = /[.-]/g
const LOOSE_STRIP_REGEX = /[^\d]/g

// Regiões Fiscais da Receita Federal codificadas na 9ª posição do CPF.
// Fonte: Instrução Normativa RFB sobre CPF (regra histórica mantida).
export const FISCAL_REGION_BY_UF = {
  DF: 1,
  GO: 1,
  MS: 1,
  MT: 1,
  TO: 1,
  AC: 2,
  AM: 2,
  AP: 2,
  PA: 2,
  RO: 2,
  RR: 2,
  CE: 3,
  MA: 3,
  PI: 3,
  AL: 4,
  PB: 4,
  PE: 4,
  RN: 4,
  BA: 5,
  SE: 5,
  MG: 6,
  ES: 7,
  RJ: 7,
  SP: 8,
  PR: 9,
  SC: 9,
  RS: 0
} as const

export type UF = keyof typeof FISCAL_REGION_BY_UF

export interface GenerateOptions {
  formatted?: boolean
  state?: UF
}

function strip(value: string, strict?: boolean): string {
  if (typeof value !== 'string') return ''
  const regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX
  return value.replace(regex, '')
}

function format(value: string): string {
  return strip(value).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

function isValid(value: string, strict?: boolean): boolean {
  const stripped = strip(value, strict)
  if (!stripped || stripped.length !== 11 || BLACKLIST.has(stripped)) {
    return false
  }

  let numbers = stripped.slice(0, 9)
  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return numbers.slice(-2) === stripped.slice(-2)
}

function generate(options?: boolean | GenerateOptions): string {
  const opts: GenerateOptions =
    typeof options === 'boolean' ? { formatted: options } : (options ?? {})

  let numbers = ''
  for (let i = 0; i < 8; i++) {
    numbers += Math.floor(Math.random() * 10)
  }
  numbers +=
    opts.state !== undefined ? FISCAL_REGION_BY_UF[opts.state] : Math.floor(Math.random() * 10)

  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return opts.formatted ? format(numbers) : numbers
}

export { format, generate, isValid, strip, verifierDigit }
export default { verifierDigit, strip, format, isValid, generate, FISCAL_REGION_BY_UF }
