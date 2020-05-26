// Blacklist common values.
const BLACKLIST: Array<string> = [
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
]

const STRICT_STRIP_REGEX: RegExp = /[.-]/g
const LOOSE_STRIP_REGEX: RegExp = /[^\d]/g

const verifierDigit = (digits: string): number => {
  const numbers: Array<number> = digits
    .split('')
    .map(number => {
      return parseInt(number, 10)
    })

  const modulus: number = numbers.length + 1
  const multiplied: Array<number> = numbers.map((number, index) => number * (modulus - index))
  const mod: number = multiplied.reduce((buffer, number) => buffer + number) % 11

  return (mod < 2 ? 0 : 11 - mod)
}

const strip = (number: string, strict?: boolean): string => {
  const regex: RegExp = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX
  return (number || '').replace(regex, '')
}

const format = (number: string): string => {
  return strip(number).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

const isValid = (number: string, strict?: boolean): boolean => {
  const stripped: string = strip(number, strict)

  // CPF must be defined
  if (!stripped) {
    return false
  }

  // CPF must have 11 chars
  if (stripped.length !== 11) {
    return false
  }

  // CPF can't be blacklisted
  if (BLACKLIST.includes(stripped)) {
    return false
  }

  let numbers: string = stripped.substr(0, 9)
  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)

  return numbers.substr(-2) === stripped.substr(-2)
}

const generate = (formatted?: boolean): string => {
  let numbers: string = ''

  for (let i = 0; i < 9; i += 1) {
    numbers += Math.floor(Math.random() * 9)
  }

  numbers += verifierDigit(numbers)
  numbers += verifierDigit(numbers)

  return (formatted ? format(numbers) : numbers)
}

export default {
  verifierDigit,
  strip,
  format,
  isValid,
  generate,
}
