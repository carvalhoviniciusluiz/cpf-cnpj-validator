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

/**
 * Mapa dos 27 UFs brasileiros para seus dígitos de Região Fiscal da
 * Receita Federal (0..9), codificados na 9ª posição do CPF.
 *
 * @example
 * ```ts
 * FISCAL_REGION_BY_UF.SP // 8 (São Paulo — 8ª Região Fiscal)
 * FISCAL_REGION_BY_UF.RS // 0 (Rio Grande do Sul — 10ª Região Fiscal)
 * ```
 */
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

/** Unidade da Federação — um dos 26 estados brasileiros ou DF. */
export type UF = keyof typeof FISCAL_REGION_BY_UF

/** Opções para `cpf.generate()`. */
export interface GenerateOptions {
  /** Retorna o CPF com máscara `XXX.XXX.XXX-XX` quando `true`. */
  formatted?: boolean
  /** UF de emissão — controla o dígito da Região Fiscal (9ª posição). */
  state?: UF
}

/**
 * Remove caracteres de máscara e normaliza um CPF.
 *
 * @param value - Entrada a ser normalizada.
 * @param strict - Se `true`, remove apenas `.` e `-`. Se `false` ou omitido,
 *   remove qualquer caractere não numérico.
 * @returns Apenas os dígitos remanescentes.
 */
function strip(value: string, strict?: boolean): string {
  if (typeof value !== 'string') return ''
  const regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX
  return value.replace(regex, '')
}

/**
 * Aplica a máscara oficial `XXX.XXX.XXX-XX` no CPF.
 *
 * @param value - CPF cru ou já formatado.
 * @returns O CPF com máscara, ou a entrada normalizada quando não casar
 *   com o padrão de 11 dígitos.
 */
function format(value: string): string {
  return strip(value).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

/**
 * Valida um CPF verificando tamanho, lista negra e os dois dígitos
 * verificadores via Módulo 11.
 *
 * @param value - CPF (cru, formatado ou com lixo, conforme `strict`).
 * @param strict - Se `true`, só aceita máscara canônica `XXX.XXX.XXX-XX`
 *   ou 11 dígitos puros. Se `false` ou omitido, remove qualquer lixo.
 * @returns `true` se o CPF é válido; `false` caso contrário.
 *
 * @example
 * ```ts
 * cpf.isValid('295.379.955-93') // true
 * cpf.isValid('29537995593')    // true
 * cpf.isValid('00000000000')    // false (blacklist)
 * ```
 */
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

/**
 * Gera um CPF matematicamente válido, opcionalmente formatado ou
 * vinculado a uma UF específica (via Região Fiscal da RFB).
 *
 * @param options - Boolean legado (apenas `formatted`) ou objeto com
 *   `formatted` e/ou `state`. Quando `state` é informado, a 9ª posição
 *   recebe o dígito da Região Fiscal correspondente.
 * @returns CPF gerado, com 11 dígitos crus ou a máscara oficial.
 * @throws {TypeError} Se `options.state` for informado mas não for um UF
 *   conhecido.
 *
 * @example
 * ```ts
 * cpf.generate()                                // '32564428777'
 * cpf.generate(true)                            // '325.644.287-77'
 * cpf.generate({ state: 'SP' })                 // '...8??' (8ª posição = RF SP)
 * cpf.generate({ formatted: true, state: 'SP' }) // '325.644.287-77' (9ª = '8')
 * ```
 */
function generate(options?: boolean | GenerateOptions): string {
  const opts: GenerateOptions =
    typeof options === 'boolean' ? { formatted: options } : (options ?? {})

  let numbers = ''
  for (let i = 0; i < 8; i++) {
    numbers += Math.floor(Math.random() * 10)
  }

  if (opts.state !== undefined) {
    if (!Object.hasOwn(FISCAL_REGION_BY_UF, opts.state)) {
      throw new TypeError(
        `UF '${opts.state}' desconhecida — use uma das: ${Object.keys(FISCAL_REGION_BY_UF).join(', ')}`
      )
    }
    numbers += FISCAL_REGION_BY_UF[opts.state]
  } else {
    numbers += Math.floor(Math.random() * 10)
  }

  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)
  return opts.formatted ? format(numbers) : numbers
}

export { format, generate, isValid, strip, verifierDigit }
export default { verifierDigit, strip, format, isValid, generate, FISCAL_REGION_BY_UF }
