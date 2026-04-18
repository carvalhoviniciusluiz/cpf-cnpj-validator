import { describe, expect, test } from 'vitest'
import { cpf } from '../src'
import { FISCAL_REGION_BY_UF, type UF } from '../src/cpf'

describe('CPF', () => {
  test('números de listas negras', () => {
    expect(cpf.isValid('00000000000')).toBeFalsy()
    expect(cpf.isValid('11111111111')).toBeFalsy()
    expect(cpf.isValid('22222222222')).toBeFalsy()
    expect(cpf.isValid('33333333333')).toBeFalsy()
    expect(cpf.isValid('44444444444')).toBeFalsy()
    expect(cpf.isValid('55555555555')).toBeFalsy()
    expect(cpf.isValid('66666666666')).toBeFalsy()
    expect(cpf.isValid('77777777777')).toBeFalsy()
    expect(cpf.isValid('88888888888')).toBeFalsy()
    expect(cpf.isValid('99999999999')).toBeFalsy()
    expect(cpf.isValid('12345678909')).toBeFalsy()
  })

  test('rejeita valores falsos', () => {
    expect(cpf.isValid('')).toBeFalsy()
    expect(cpf.isValid(null as unknown as string)).toBeFalsy()
    expect(cpf.isValid(undefined as unknown as string)).toBeFalsy()
  })

  test('valida strings formatadas', () => {
    expect(cpf.isValid('295.379.955-93')).toBeTruthy()
  })

  test('valida strings não formatadas', () => {
    expect(cpf.isValid('29537995593')).toBeTruthy()
  })

  test('valida strings de caracteres confusas', () => {
    expect(cpf.isValid('295$379\n955...93')).toBeTruthy()
  })

  test('valida cadeias de caracteres em modo strict', () => {
    expect(cpf.isValid('295$379\n955...93', true)).toBeFalsy()
    expect(cpf.isValid('295.379.955-93', true)).toBeTruthy()
    expect(cpf.isValid('29537995593', true)).toBeTruthy()
  })

  test('retorna o número não formatado', () => {
    expect(cpf.strip('295.379.955-93')).toEqual('29537995593')
  })

  test('retorna o número formatado', () => {
    expect(cpf.format('29537995593')).toEqual('295.379.955-93')
  })

  test('gera número formatado', () => {
    const number = cpf.generate(true)
    expect(number).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })

  test('gera número não formatado', () => {
    const number = cpf.generate()
    expect(number).toMatch(/^\d{11}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })

  test('gera número com formato via objeto de opções', () => {
    const number = cpf.generate({ formatted: true })
    expect(number).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })

  /**
   * SPECIFICATION: Regra histórica da Receita Federal — a 9ª posição do CPF
   *                codifica a Região Fiscal (1..10) que emitiu o documento.
   * BEHAVIOR: Dado um UF de emissão (ex: 'SP'), quando chamamos
   *           cpf.generate({ state }), então a 9ª posição do CPF gerado
   *           equivale ao código da Região Fiscal do estado e o CPF
   *           resultante é matematicamente válido.
   * INTENT: Documentar executavelmente a feature de geração regional
   *         introduzida em v2, garantindo que o mapa UF → Região Fiscal
   *         cubra os estados mais populosos (SP=8, RJ=7, MG=6, RS=0,
   *         DF=1, AM=2).
   * FLOW: cpf.generate({ state }) → aleatoriza 8 dígitos → a 9ª posição
   *       recebe FISCAL_REGION_BY_UF[state] → cpfDigit × 2 → concatena
   *       os 2 DVs na ponta.
   * MIGRATION: v1 não tinha geração regional — consumidores v1 com
   *            cpf.generate(true) continuam funcionando sem alteração.
   * @covers src/cpf.ts generate, FISCAL_REGION_BY_UF
   * @see Instrução Normativa RFB sobre CPF (regra histórica mantida)
   */
  test('gera CPF com dígito de Região Fiscal correspondente ao estado', () => {
    const cases: Array<[UF, string]> = [
      ['SP', '8'],
      ['RJ', '7'],
      ['MG', '6'],
      ['RS', '0'],
      ['DF', '1'],
      ['AM', '2']
    ]
    for (const [state, expected] of cases) {
      const number = cpf.generate({ state })
      expect(number[8]).toEqual(expected)
      expect(cpf.isValid(number)).toBeTruthy()
    }
  })

  /**
   * SPECIFICATION: Combinação dos dois modos da API de opções —
   *                formatted=true + state=UF simultaneamente.
   * BEHAVIOR: Dado state='SP' e formatted=true, o CPF gerado casa a
   *           máscara XXX.XXX.XX8-XX (o dígito 8 = RF de São Paulo fica
   *           na 9ª posição, antes dos dois DVs) e é válido.
   * INTENT: Garantir que o objeto de opções aceita múltiplos campos
   *         simultâneos e que a formatação preserva o dígito de RF.
   * FLOW: generate({formatted:true, state:'SP'}) → gera base regional
   *       → format aplica máscara XXX.XXX.XXX-XX.
   * @covers src/cpf.ts generate, format
   */
  test('gera CPF formatado para um estado específico', () => {
    const number = cpf.generate({ formatted: true, state: 'SP' })
    expect(number).toMatch(/^\d{3}\.\d{3}\.\d{2}8-\d{2}$/)
    expect(cpf.isValid(number)).toBeTruthy()
  })

  /**
   * SPECIFICATION: generate({state}) deve lançar TypeError com lista de
   *                UFs válidas quando o state não existe no mapa.
   * BEHAVIOR: cpf.generate({ state: 'XX' as UF }) lança TypeError cuja
   *           mensagem inclui a UF desconhecida e os 27 valores válidos.
   * INTENT: Proteger consumidores JS (sem checagem de tipo em build)
   *         e consumidores TS que usam @ts-expect-error ou `as any`.
   *         Sem esse guard, a API silenciosamente gera um CPF com
   *         'undefined' concatenado — bug invisível em produção.
   * @covers src/cpf.ts generate (runtime guard)
   */
  test('gera TypeError ao receber UF desconhecida', () => {
    expect(() => cpf.generate({ state: 'XX' as UF })).toThrow(TypeError)
    expect(() => cpf.generate({ state: 'XX' as UF })).toThrow(/UF 'XX' desconhecida/)
  })

  /**
   * SPECIFICATION: Brasil tem 26 estados + DF = 27 UFs. Todos devem estar
   *                no mapa público FISCAL_REGION_BY_UF, cada um apontando
   *                para um dígito 0..9 da Região Fiscal.
   * BEHAVIOR: Object.keys(map) retorna exatamente 27 entradas; cada
   *           value é inteiro no intervalo [0, 9].
   * INTENT: Travar o contrato de cobertura geográfica — qualquer remoção
   *         acidental de UF do mapa (refactor de tipos, rename, merge
   *         conflict) vai falhar aqui antes de quebrar o generate().
   * @covers src/cpf.ts FISCAL_REGION_BY_UF
   */
  test('FISCAL_REGION_BY_UF cobre todos os 26 estados + DF', () => {
    expect(Object.keys(FISCAL_REGION_BY_UF)).toHaveLength(27)
    for (const digit of Object.values(FISCAL_REGION_BY_UF)) {
      expect(digit).toBeGreaterThanOrEqual(0)
      expect(digit).toBeLessThanOrEqual(9)
    }
  })

  test('rejeita CPF com dígito verificador inválido', () => {
    expect(cpf.isValid('29537995592')).toBeFalsy()
    expect(cpf.isValid('29537995594')).toBeFalsy()
  })

  test('rejeita CPF com tamanho incorreto', () => {
    expect(cpf.isValid('1')).toBeFalsy()
    expect(cpf.isValid('2953799559')).toBeFalsy()
    expect(cpf.isValid('295379955930')).toBeFalsy()
  })

  /**
   * SPECIFICATION: Algoritmo Módulo 11 do CPF — pesos LINEARES crescentes
   *                2, 3, 4, ... da direita pra esquerda (diferente do
   *                CNPJ, que usa pesos cíclicos 2..9).
   * BEHAVIOR: Para a base '295379955' (9 dígitos) DV1 = 9; concatenando
   *           DV1 → '2953799559' (10 dígitos) e recalculando, DV2 = 3.
   *           Resultado final '29537995593' (CPF canônico usado como
   *           baseline em toda a suíte).
   * INTENT: Validar o algoritmo de Módulo 11 do CPF isoladamente. O CPF
   *         usa pesos LINEARES (diferente do CNPJ que usa cíclicos) —
   *         esse teste protege contra unificação acidental dos dois
   *         algoritmos num único core compartilhado.
   * FLOW: cpfDigit(digits) → Σ (charCodeAt(d) - 48) × (n - i + 1)
   *       onde i é o índice 0-based da esquerda → mod 11 → se <2 devolve
   *       0 senão 11 - mod.
   * MIGRATION: Em uma tentativa de refactor unificado na v2, o algoritmo
   *            cíclico foi aplicado ao CPF — esse teste detectou
   *            imediatamente a divergência, resultando nos dois algoritmos
   *            separados (cpfDigit + cnpjDigit) em core/modulo11.ts.
   * @covers src/core/modulo11.ts cpfDigit
   */
  test('calcula verifierDigit corretamente', () => {
    expect(cpf.verifierDigit('295379955')).toBe(9)
    expect(cpf.verifierDigit('2953799559')).toBe(3)
  })

  test('strip em modo strict remove apenas pontos e hífens', () => {
    expect(cpf.strip('295.379.955-93', true)).toEqual('29537995593')
    expect(cpf.strip('295$379\n955...93', true)).toEqual('295$379\n95593')
  })

  test('format retorna entrada intacta quando não casa a máscara', () => {
    expect(cpf.format('123')).toEqual('123')
    expect(cpf.format('abc')).toEqual('')
  })
})
