import { bench, describe } from 'vitest'
import { cnpj, cpf } from '../src'

describe('cpf.generate', () => {
  bench('generate()', () => {
    cpf.generate()
  })

  bench('generate(true) — formatado', () => {
    cpf.generate(true)
  })

  bench('generate({ state: "SP" })', () => {
    cpf.generate({ state: 'SP' })
  })

  bench('generate({ formatted: true, state: "SP" })', () => {
    cpf.generate({ formatted: true, state: 'SP' })
  })
})

describe('cnpj.generate', () => {
  bench('generate()', () => {
    cnpj.generate()
  })

  bench('generate(true) — formatado alfanumérico', () => {
    cnpj.generate(true)
  })
})
