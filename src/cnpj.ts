import { cnpjDigit as verifierDigit } from './core/modulo11'

const BLACKLIST = new Set<string>([
  '00000000000000',
  '11111111111111',
  '22222222222222',
  '33333333333333',
  '44444444444444',
  '55555555555555',
  '66666666666666',
  '77777777777777',
  '88888888888888',
  '99999999999999'
])

const STRICT_STRIP_REGEX = /[./-]/g
const LOOSE_STRIP_REGEX = /[^\dA-Z]/g
const VALID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface GenerateOptions {
  formatted?: boolean
}

function strip(value: string, strict?: boolean): string {
  if (typeof value !== 'string') return ''
  const normalized = strict ? value : value.toUpperCase()
  const regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX
  return normalized.replace(regex, '')
}

function format(value: string): string {
  return strip(value).replace(
    /^([\dA-Z]{2})([\dA-Z]{3})([\dA-Z]{3})([\dA-Z]{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

function isValid(value: string, strict?: boolean): boolean {
  const stripped = strip(value, strict)
  if (!stripped || stripped.length !== 14 || BLACKLIST.has(stripped)) {
    return false
  }
  // DVs (últimas 2 posições) devem ser numéricos pela regra da RFB.
  if (!/^\d{2}$/.test(stripped.slice(-2))) {
    return false
  }

  let numbers = stripped.slice(0, 12)
  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return numbers.slice(-2) === stripped.slice(-2)
}

function generate(options?: boolean | GenerateOptions): string {
  const opts: GenerateOptions =
    typeof options === 'boolean' ? { formatted: options } : (options ?? {})

  let numbers = ''
  for (let i = 0; i < 12; i++) {
    numbers += VALID_CHARS[Math.floor(Math.random() * VALID_CHARS.length)]
  }
  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return opts.formatted ? format(numbers) : numbers
}

export { format, generate, isValid, strip, verifierDigit }
export default { verifierDigit, strip, format, isValid, generate }
