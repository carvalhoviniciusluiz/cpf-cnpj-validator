// Algoritmo Módulo 11 da Receita Federal. Cada caractere é convertido pelo
// valor ASCII menos 48 (0-9 → 0-9, A-Z → 17-42) e multiplicado pelos pesos
// respectivos. CPF e CNPJ compartilham a etapa final (mod 11 → DV) mas
// usam pesos distintos:
//   - CPF: pesos 2, 3, 4, ... crescendo da direita pra esquerda sem ciclo.
//   - CNPJ: pesos cíclicos 2, 3, ..., 9, 2, 3, ... da direita pra esquerda
//     (necessário por ter 12+ posições; definido na Nota Técnica RFB 49/2024).

/**
 * Calcula o dígito verificador de um CPF usando o algoritmo Módulo 11
 * com pesos lineares crescentes.
 *
 * @param digits - String com 9 dígitos (para DV1) ou 10 dígitos (para DV2).
 * @returns Dígito verificador (0..9).
 */
export function cpfDigit(digits: string): number {
  let sum = 0
  const n = digits.length
  for (let i = n - 1; i >= 0; i--) {
    sum += (digits.charCodeAt(i) - 48) * (n - i + 1)
  }
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
}

/**
 * Calcula o dígito verificador de um CNPJ usando o algoritmo Módulo 11
 * com pesos cíclicos 2..9.
 *
 * Aceita tanto CNPJs puramente numéricos quanto no formato alfanumérico
 * da Nota Técnica RFB 49/2024 (letras A-Z convertidas via ASCII - 48).
 *
 * @param digits - String com 12 dígitos (para DV1) ou 13 dígitos (para DV2).
 * @returns Dígito verificador (0..9).
 */
export function cnpjDigit(digits: string): number {
  let sum = 0
  let weight = 2
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += (digits.charCodeAt(i) - 48) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
}
