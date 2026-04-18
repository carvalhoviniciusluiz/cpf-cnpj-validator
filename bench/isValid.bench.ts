import { bench, describe } from 'vitest'
import { cnpj, cpf } from '../src'

// Benchmark do hot-path de validação. Consumidores típicos validam
// milhares de CPFs/CNPJs em loops (importação de planilhas, listas
// de clientes). Qualquer regressão aqui vira custo real em produção.

describe('cpf.isValid', () => {
  bench('CPF formatado válido', () => {
    cpf.isValid('295.379.955-93')
  })

  bench('CPF cru válido', () => {
    cpf.isValid('29537995593')
  })

  bench('CPF com lixo (loose strip)', () => {
    cpf.isValid('295$379\n955...93')
  })

  bench('CPF inválido (DV errado)', () => {
    cpf.isValid('29537995594')
  })

  bench('CPF da blacklist', () => {
    cpf.isValid('11111111111')
  })

  bench('CPF strict com formato canônico', () => {
    cpf.isValid('295.379.955-93', true)
  })
})

describe('cnpj.isValid', () => {
  bench('CNPJ numérico formatado válido', () => {
    cnpj.isValid('54.550.752/0001-55')
  })

  bench('CNPJ numérico cru válido', () => {
    cnpj.isValid('54550752000155')
  })

  bench('CNPJ alfanumérico oficial RFB (formatado)', () => {
    cnpj.isValid('12.ABC.345/01DE-35')
  })

  bench('CNPJ alfanumérico oficial RFB (cru)', () => {
    cnpj.isValid('12ABC34501DE35')
  })

  bench('CNPJ alfanumérico em minúsculas (loose normaliza)', () => {
    cnpj.isValid('12abc34501de35')
  })

  bench('CNPJ inválido (DV errado)', () => {
    cnpj.isValid('54550752000154')
  })

  bench('CNPJ da blacklist', () => {
    cnpj.isValid('11111111111111')
  })
})
