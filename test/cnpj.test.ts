import { describe, expect, test } from 'vitest'
import { cnpj } from '../src'

describe('CNPJ', () => {
  test('números de listas negras', () => {
    expect(cnpj.isValid('00000000000000')).toBeFalsy()
    expect(cnpj.isValid('11111111111111')).toBeFalsy()
    expect(cnpj.isValid('22222222222222')).toBeFalsy()
    expect(cnpj.isValid('33333333333333')).toBeFalsy()
    expect(cnpj.isValid('44444444444444')).toBeFalsy()
    expect(cnpj.isValid('55555555555555')).toBeFalsy()
    expect(cnpj.isValid('66666666666666')).toBeFalsy()
    expect(cnpj.isValid('77777777777777')).toBeFalsy()
    expect(cnpj.isValid('88888888888888')).toBeFalsy()
    expect(cnpj.isValid('99999999999999')).toBeFalsy()
  })

  test('rejeita valores falsos', () => {
    expect(cnpj.isValid('')).toBeFalsy()
    expect(cnpj.isValid(null as unknown as string)).toBeFalsy()
    expect(cnpj.isValid(undefined as unknown as string)).toBeFalsy()
  })

  test('valida strings formatadas', () => {
    expect(cnpj.isValid('54.550.752/0001-55')).toBeTruthy()
  })

  test('valida strings não formatadas', () => {
    expect(cnpj.isValid('54550752000155')).toBeTruthy()
  })

  test('valida strings confusas', () => {
    expect(cnpj.isValid('54550[752#0001..$55')).toBeTruthy()
  })

  test('valida cadeias de caracteres em modo strict', () => {
    expect(cnpj.isValid('54550[752#0001..$55', true)).toBeFalsy()
    expect(cnpj.isValid('54.550.752/0001-55', true)).toBeTruthy()
    expect(cnpj.isValid('54550752000155', true)).toBeTruthy()
  })

  test('retorna número não formatado', () => {
    expect(cnpj.strip('54550[752#0001..$55')).toEqual('54550752000155')
  })

  test('retorna número formatado', () => {
    expect(cnpj.format('54550752000155')).toEqual('54.550.752/0001-55')
  })

  test('gera número formatado', () => {
    const number = cnpj.generate(true)
    expect(number).toMatch(/^[\dA-Z]{2}\.[\dA-Z]{3}\.[\dA-Z]{3}\/[\dA-Z]{4}-\d{2}$/)
    expect(cnpj.isValid(number)).toBeTruthy()
  })

  test('gera número não formatado', () => {
    const number = cnpj.generate()
    expect(number).toMatch(/^[\dA-Z]{12}\d{2}$/)
    expect(cnpj.isValid(number)).toBeTruthy()
  })

  test('gera número via objeto de opções', () => {
    const number = cnpj.generate({ formatted: true })
    expect(number).toMatch(/^[\dA-Z]{2}\.[\dA-Z]{3}\.[\dA-Z]{3}\/[\dA-Z]{4}-\d{2}$/)
    expect(cnpj.isValid(number)).toBeTruthy()
  })

  /**
   * SPECIFICATION: Nota Técnica Conjunta COCAD/SUARA/RFB nº 49/2024 —
   *                vetor canônico publicado na pergunta 14 do PDF oficial:
   *                CNPJ 12.ABC.345/01DE-35 com DV1=3 e DV2=5.
   * BEHAVIOR: cnpj.isValid aceita o CNPJ oficial com e sem máscara;
   *           cnpj.verifierDigit retorna exatamente os DVs publicados
   *           pela Receita Federal.
   * INTENT: Travar conformidade com o único vetor oficial publicado
   *         pela RFB — qualquer regressão no algoritmo alfanumérico
   *         falha aqui antes de chegar em produção (obrigatório jul/2026).
   * FLOW: isValid → strip → length check (14) → blacklist check →
   *       validação /^\d{2}$/ dos DVs → cnpjDigit × 2 → compara.
   * MIGRATION: v1.0.3 (publicado em 2020) rejeita este CNPJ porque o
   *            parseInt falhava em qualquer letra. A v2 reimplementa o
   *            cálculo via (charCodeAt - 48), seguindo a tabela ASCII
   *            da Nota Técnica.
   * @covers src/cnpj.ts isValid, src/core/modulo11.ts cnpjDigit
   * @see https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico
   * @see https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/45
   */
  test('valida CNPJ alfanumérico oficial da Receita Federal', () => {
    expect(cnpj.isValid('12ABC34501DE35')).toBeTruthy()
    expect(cnpj.isValid('12.ABC.345/01DE-35')).toBeTruthy()
    expect(cnpj.verifierDigit('12ABC34501DE')).toBe(3)
    expect(cnpj.verifierDigit('12ABC34501DE3')).toBe(5)
  })

  /**
   * SPECIFICATION: Pergunta 23 do PDF oficial — a raiz (8 primeiras
   *                posições) e a ordem da filial (9ª-12ª) podem ser
   *                independentemente numéricas ou alfanuméricas.
   * BEHAVIOR: As três combinações oficiais validam como true:
   *           - AA345678/0001-14 (raiz alfa, filial numérica)
   *           - AA345678/000A-29 (raiz alfa, filial alfa)
   *           - 12.345.678/000A-08 (raiz numérica, filial alfa)
   * INTENT: Documentar que qualquer combinação raiz/filial é aceita,
   *         alinhando com a política RFB de que "as letras serão
   *         completamente aleatórias" (pergunta 18 do PDF).
   * @covers src/cnpj.ts isValid, src/core/modulo11.ts cnpjDigit
   * @see cnpj-alfanumerico.pdf perguntas 18 e 23
   */
  test('valida exemplos alfanuméricos de raiz/filial da RFB', () => {
    expect(cnpj.isValid('AA345678000114')).toBeTruthy()
    expect(cnpj.isValid('AA345678000A29')).toBeTruthy()
    expect(cnpj.isValid('12345678000A08')).toBeTruthy()
  })

  /**
   * SPECIFICATION: Requisito de UX — entradas vindas de UIs e formulários
   *                frequentemente contêm minúsculas; em modo loose a lib
   *                normaliza via toUpperCase() antes de validar.
   * BEHAVIOR: '12abc34501de35' e '12.abc.345/01de-35' são aceitos como
   *           true em modo loose (equivalem ao CNPJ alfanumérico
   *           canônico '12ABC34501DE35' após normalização).
   * INTENT: Reduzir erros de integração quando UIs recebem texto livre,
   *         sem violar a regra da RFB (que só emite em maiúsculas).
   * FLOW: strip → normalized = value.toUpperCase() → remove LOOSE_STRIP_REGEX
   *       → isValid segue pipeline normal.
   * MIGRATION: v1 rejeitava minúsculas silenciosamente (parseInt
   *            retornava NaN). v2 aceita em modo loose e rejeita em
   *            modo strict — ver teste companion logo abaixo.
   * @covers src/cnpj.ts strip (toUpperCase), isValid
   */
  test('normaliza letras minúsculas em modo loose', () => {
    expect(cnpj.isValid('12abc34501de35')).toBeTruthy()
    expect(cnpj.isValid('12.abc.345/01de-35')).toBeTruthy()
  })

  /**
   * SPECIFICATION: Em modo strict a string precisa estar exatamente no
   *                formato canônico da RFB — apenas letras maiúsculas.
   * BEHAVIOR: cnpj.isValid('12abc34501de35', true) retorna false porque
   *           charCodeAt('a')-48 = 49 (não mapeia para valor 0..42 da
   *           tabela ASCII da RFB) e o DV calculado diverge do recebido.
   * INTENT: Contraparte do teste de modo loose — garante que strict é
   *         de fato estrito e não aplica toUpperCase silenciosamente.
   * @covers src/cnpj.ts strip (sem normalização em strict), isValid
   * @see cnpj-alfanumerico.pdf pergunta 14 (tabela ASCII oficial)
   */
  test('rejeita letras minúsculas em modo strict', () => {
    expect(cnpj.isValid('12abc34501de35', true)).toBeFalsy()
  })

  /**
   * SPECIFICATION: Pergunta 2 do PDF oficial — "DV: Dígito Verificador
   *                utilizando o cálculo pelo módulo 11". O DV resultante
   *                do mod 11 é sempre 0..9 (numérico), pela definição
   *                matemática do algoritmo.
   * BEHAVIOR: '12ABC34501DE3A' (DV2 substituído por 'A') é rejeitado
   *           mesmo sendo alfanumericamente plausível, pois os DVs
   *           precisam ser numéricos.
   * INTENT: Travar a regra invariante "DVs numéricos", impedindo que
   *         um bug futuro no regex de format/strip aceite CNPJs
   *         alfanuméricos com letras nos últimos 2 dígitos.
   * FLOW: isValid → check /^\d{2}$/ nos últimos 2 chars → early return
   *       false antes de chegar no cnpjDigit.
   * @covers src/cnpj.ts isValid (validação do shape do DV)
   */
  test('rejeita CNPJ alfanumérico com dígito verificador alfabético', () => {
    expect(cnpj.isValid('12ABC34501DE3A')).toBeFalsy()
  })

  test('rejeita CNPJ com dígito verificador inválido', () => {
    expect(cnpj.isValid('54550752000154')).toBeFalsy()
    expect(cnpj.isValid('54550752000156')).toBeFalsy()
  })

  test('rejeita CNPJ com tamanho incorreto', () => {
    expect(cnpj.isValid('1')).toBeFalsy()
    expect(cnpj.isValid('5455075200015')).toBeFalsy()
    expect(cnpj.isValid('545507520001555')).toBeFalsy()
  })

  /**
   * SPECIFICATION: Algoritmo Módulo 11 do CNPJ — pesos CÍCLICOS 2..9 da
   *                direita pra esquerda (conforme Nota Técnica RFB
   *                49/2024). Necessário ser cíclico por causa das 12+
   *                posições da base.
   * BEHAVIOR: Para base '545507520001' (12 dígitos) DV1 = 5; concatenando
   *           DV1 → '5455075200015' (13 dígitos) DV2 = 5. CNPJ final
   *           '54550752000155' (baseline numérico usado em toda a suíte).
   * INTENT: Isolar o algoritmo cíclico do CNPJ (contraparte do cpfDigit
   *         linear). Garante que CNPJs numéricos puros — 100% da base
   *         instalada em produção hoje — permanecem válidos na v2.
   * FLOW: cnpjDigit(digits) → Σ (charCodeAt - 48) × weight onde weight
   *       começa em 2 e cicla 2, 3, ..., 9, 2, 3, ... da direita para
   *       esquerda → mod 11 → se <2 devolve 0 senão 11 - mod.
   * @covers src/core/modulo11.ts cnpjDigit
   */
  test('calcula verifierDigit corretamente para CNPJ numérico', () => {
    expect(cnpj.verifierDigit('545507520001')).toBe(5)
    expect(cnpj.verifierDigit('5455075200015')).toBe(5)
  })

  test('strip em modo strict remove apenas pontos, barras e hífens', () => {
    expect(cnpj.strip('54.550.752/0001-55', true)).toEqual('54550752000155')
    expect(cnpj.strip('54550[752#0001..$55', true)).toEqual('54550[752#0001$55')
  })

  /**
   * SPECIFICATION: STRICT_STRIP_REGEX do CNPJ deve remover APENAS os
   *                caracteres da máscara oficial da RFB: ponto, barra e
   *                hífen. Qualquer outro caractere (incluindo contrabarra)
   *                permanece intacto para que a validação falhe.
   * BEHAVIOR: cnpj.strip('54\\550752000155', true) retorna a string
   *           original inalterada — a contrabarra permanece na saída.
   * INTENT: Regressão documentada. Em v1 o regex era /[-\\/.]/g e
   *         incluía o caractere '\' dentro da classe (artefato do
   *         escape TS). Entradas contendo '\' eram silenciosamente
   *         stripadas, deixando a lib aceitar formatos que não deveriam
   *         passar.
   * MIGRATION: v1: cnpj.strip('54\\550752000155', true) → '54550752000155'
   *            v2: cnpj.strip('54\\550752000155', true) → '54\\550752000155'
   * @covers src/cnpj.ts STRICT_STRIP_REGEX, strip
   */
  test('strip em modo strict preserva contrabarra (corrige bug legado)', () => {
    expect(cnpj.strip('54\\550752000155', true)).toEqual('54\\550752000155')
  })

  /**
   * SPECIFICATION: Máscara oficial da RFB para CNPJ (numérico ou alfa):
   *                XX.XXX.XXX/XXXX-YY, onde X ∈ [0-9A-Z] e Y ∈ [0-9].
   * BEHAVIOR: cnpj.format('12ABC34501DE35') → '12.ABC.345/01DE-35'.
   * INTENT: Garantir que a função format casa tanto CNPJs alfanuméricos
   *         quanto numéricos usando a mesma máscara oficial, sem
   *         precisar de funções separadas no consumidor.
   * @covers src/cnpj.ts format
   */
  test('formata CNPJ alfanumérico com a máscara oficial', () => {
    expect(cnpj.format('12ABC34501DE35')).toEqual('12.ABC.345/01DE-35')
  })
})
