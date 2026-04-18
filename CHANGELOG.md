# cpf-cnpj-validator

## 2.1.0

### Minor Changes

- bbd77fe: ## Angular adapter (v2.1.0)

  Adiciona `cpf-cnpj-validator/angular` — adapter nativo para Angular Reactive Forms, fechando um pedido de 6 anos.

  **API moderna (idiomática Angular 17+)**:

  ```ts
  import { cpfValidator, cnpjValidator } from "cpf-cnpj-validator/angular";

  new FormGroup({
    cpf: new FormControl("", [Validators.required, cpfValidator()]),
    cnpj: new FormControl("", [cnpjValidator()]),
  });
  ```

  **API legada (estilo classe)**:

  ```ts
  import { AngularValidator } from "cpf-cnpj-validator/angular";

  new FormControl("", [AngularValidator.cpf, AngularValidator.cnpj]);
  ```

  Ambas aceitam CNPJ alfanumérico (NT RFB 49/2024). Peer dep `@angular/forms >=15` opcional — consumidores não-Angular não são afetados.

  ### Créditos

  Proposta original: [PR #21](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21) de [@rodzappa](https://github.com/rodzappa) em nov/2020. A implementação ficou em standby por 6 anos porque adicionava `@angular/*` + `rxjs` como `dependencies` diretas, forçando ~10 MB de Angular em todo consumidor. A v2 trouxe a arquitetura de peer deps opcionais + subpath exports que permitiu trazer a ideia de volta com custo zero pra quem não usa Angular. Obrigado Rodolfo pela ideia!

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
