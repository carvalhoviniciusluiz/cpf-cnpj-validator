# cpf-cnpj-validator

## 2.0.0

### Major Changes

- 94684d3: # v2.0.0 — Revitalização completa

  ## Novidades

  - **CNPJ alfanumérico** conforme Nota Técnica Conjunta COCAD/SUARA/RFB nº 49/2024 (vigência obrigatória em julho/2026). CNPJs no novo formato como `12.ABC.345/01DE-35` agora são validados nativamente.
  - **Geração regional de CPF**: `cpf.generate({ state: 'SP' })` produz um CPF cuja 9ª posição codifica a Região Fiscal da UF informada.
  - **4 adapters de validação** via subpath exports:
    - `cpf-cnpj-validator/joi` — `joiValidator` para `joi.extend`
    - `cpf-cnpj-validator/yup` — `yupValidator` para `yup.addMethod`
    - `cpf-cnpj-validator/zod` — `zodValidator(z)` factory
    - `cpf-cnpj-validator/class-validator` — decorators `@IsCPF` / `@IsCNPJ` (padrão NestJS)
  - **Modo loose case-insensitive**: `cnpj.isValid('12abc34501de35')` agora aceita minúsculas (normaliza internamente).

  ## ⚠️ Breaking changes

  - `validator` não é mais exportado da raiz — use `import { joiValidator } from 'cpf-cnpj-validator/joi'`.
  - Node.js 18+ agora é requerido (era 10+).
  - `peerDependencies` tornaram-se opcionais: instale apenas os validadores que você usa.

  ## Correções

  - `cnpj` strict strip não aceita mais contrabarra indevidamente (bug legado da regex `/[-\\/.]/g`).
  - DVs alfabéticos em CNPJ agora são explicitamente rejeitados (`^\d{2}$`).
  - CNPJ `generate()` agora pode gerar o dígito 9 na base (antes `Math.random()*9` nunca produzia 9).

  ## Infraestrutura

  - **Toolchain**: jest 23 → vitest 4, ts-jest → native esbuild, bili → tsup 8, typescript 3.8 → 5.9.
  - **Biome 2** substitui ESLint + Prettier.
  - **0 vulnerabilidades** (antes: 116, incluindo 19 críticas).
  - **CI GitHub Actions** com matriz Node 18/20/22 + publint + arethetypeswrong.
  - **`"sideEffects": false`** + subpath exports = tree-shaking perfeito.
  - **Property-based testing** com fast-check e benchmarks com vitest bench.
