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

/** Opções para `cnpj.generate()`. */
export interface GenerateOptions {
  /** Retorna o CNPJ com máscara `XX.XXX.XXX/XXXX-YY` quando `true`. */
  formatted?: boolean
}

/**
 * Remove caracteres de máscara e normaliza um CNPJ.
 *
 * Em modo padrão (loose), converte minúsculas para maiúsculas e remove
 * qualquer caractere que não seja dígito ou letra A-Z. Em modo strict,
 * remove apenas `.`, `/` e `-` (máscara oficial) sem normalizar o case.
 *
 * @param value - Entrada a ser normalizada.
 * @param strict - Se `true`, só remove os caracteres da máscara oficial.
 * @returns Apenas dígitos e letras A-Z remanescentes.
 */
function strip(value: string, strict?: boolean): string {
  if (typeof value !== 'string') return ''
  const normalized = strict ? value : value.toUpperCase()
  const regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX
  return normalized.replace(regex, '')
}

/**
 * Aplica a máscara oficial `XX.XXX.XXX/XXXX-YY` no CNPJ (numérico ou
 * alfanumérico). Os 2 últimos caracteres (DVs) são sempre numéricos.
 *
 * @param value - CNPJ cru ou já formatado.
 * @returns CNPJ mascarado, ou entrada normalizada quando não casar com o
 *   padrão de 14 posições.
 */
function format(value: string): string {
  return strip(value).replace(
    /^([\dA-Z]{2})([\dA-Z]{3})([\dA-Z]{3})([\dA-Z]{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

/**
 * Valida um CNPJ verificando tamanho, lista negra, shape dos DVs e os
 * dois dígitos verificadores via Módulo 11.
 *
 * Aceita tanto CNPJs puramente numéricos (formato legado) quanto
 * alfanuméricos (novo formato da Nota Técnica RFB 49/2024 — vigência
 * obrigatória em julho/2026).
 *
 * @param value - CNPJ (cru, formatado ou com lixo, conforme `strict`).
 * @param strict - Se `true`, só aceita máscara canônica ou 14 caracteres
 *   `[0-9A-Z]` sem normalização de case.
 * @returns `true` se o CNPJ é válido; `false` caso contrário.
 *
 * @example
 * ```ts
 * cnpj.isValid('54.550.752/0001-55') // true
 * cnpj.isValid('54550752000155')     // true
 * cnpj.isValid('12ABC34501DE35')     // true (novo formato RFB)
 * cnpj.isValid('12.ABC.345/01DE-35') // true
 * ```
 */
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

/**
 * Gera um CNPJ alfanumérico matematicamente válido, seguindo o formato
 * da Nota Técnica RFB 49/2024.
 *
 * @param options - Boolean legado (apenas `formatted`) ou objeto de opções.
 * @returns CNPJ gerado com 14 caracteres (12 alfanuméricos + 2 DVs
 *   numéricos) ou a máscara oficial.
 *
 * @example
 * ```ts
 * cnpj.generate()                      // '58A0Z919U001O6'
 * cnpj.generate(true)                  // '58.A0Z.919/U001-O6' (nope — DVs sempre numéricos)
 * cnpj.generate({ formatted: true })   // '58.A0Z.919/U001-06'
 * ```
 */
function generate(options?: boolean | GenerateOptions): string {
  const opts: GenerateOptions =
    typeof options === 'boolean' ? { formatted: options } : (options ?? {})

  let numbers = ''
  for (let i = 0; i < 12; i++) {
    numbers += VALID_CHARS.charAt(Math.floor(Math.random() * VALID_CHARS.length))
  }
  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return opts.formatted ? format(numbers) : numbers
}

export { format, generate, isValid, strip, verifierDigit }
export default { verifierDigit, strip, format, isValid, generate }
