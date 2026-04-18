# cpf-cnpj-validator

> Valida, formata e gera strings de CPF ou CNPJ, com suporte ao **novo formato alfanumérico de CNPJ** da Receita Federal (Nota Técnica 49/2024, vigência julho/2026).

[![npm](https://img.shields.io/npm/v/cpf-cnpj-validator.svg?style=flat)](https://npmjs.org/package/cpf-cnpj-validator)
[![downloads](https://img.shields.io/npm/dm/cpf-cnpj-validator.svg)](https://npmjs.org/package/cpf-cnpj-validator)
![GitHub top language](https://img.shields.io/github/languages/top/carvalhoviniciusluiz/cpf-cnpj-validator)
![GitHub last commit](https://img.shields.io/github/last-commit/carvalhoviniciusluiz/cpf-cnpj-validator)
[![license](https://img.shields.io/npm/l/cpf-cnpj-validator.svg)](./LICENSE)

---

## Novidades da v2

- **CNPJ alfanumérico** da RFB (`12.ABC.345/01DE-35`) validado nativamente
- **Geração regional de CPF** por UF: `cpf.generate({ state: 'SP' })`
- **5 adapters** plug-and-play: `joi`, `yup`, `zod`, `class-validator` e `angular`
- Modo loose **case-insensitive** (aceita minúsculas)
- **0 vulnerabilidades** (antes: 116 em dev deps)
- Stack moderna: TypeScript 5.9, vitest, tsup, Node 18+
- ESM + CJS nativos, tree-shakable, types separados por subpath

Para migração da v1 → v2 veja a seção [Migração](#-migração-v1--v2).

---

## Requisitos

- **Node.js `>=18`**

## Instalação

```bash
npm install cpf-cnpj-validator
```

Os adapters são **opcionais** — instale apenas os validadores que for usar:

```bash
# escolha um ou mais
npm install joi
npm install yup
npm install zod
npm install class-validator reflect-metadata   # NestJS
npm install @angular/forms                     # Angular Reactive Forms
```

---

## Uso básico

```ts
import { cpf, cnpj } from 'cpf-cnpj-validator'

// Alternativa sem colisão com variáveis locais `cpf` / `cnpj`:
// import { cpfValidator, cnpjValidator } from 'cpf-cnpj-validator'

// ─── CPF ────────────────────────────────────────────────────────
cpf.isValid('295.379.955-93')     // true
cpf.isValid('29537995593')         // true
cpf.isValid('000.000.000-00')      // false (blacklist)

cpf.strip('295.379.955-93')        // '29537995593'
cpf.format('29537995593')          // '295.379.955-93'

cpf.generate()                     // '32564428777'
cpf.generate(true)                 // '325.644.287-77'
cpf.generate({ state: 'SP' })      // CPF de São Paulo (9ª posição = 8)
cpf.generate({ formatted: true, state: 'RJ' })

// ─── CNPJ ───────────────────────────────────────────────────────
cnpj.isValid('54.550.752/0001-55')  // true  (formato numérico legado)
cnpj.isValid('12ABC34501DE35')       // true  (novo formato alfanumérico RFB)
cnpj.isValid('12.ABC.345/01DE-35')   // true
cnpj.isValid('12abc34501de35')       // true  (loose normaliza pra maiúscula)

cnpj.format('12ABC34501DE35')        // '12.ABC.345/01DE-35'
cnpj.generate()                      // '5K0GZ919U001O6'
cnpj.generate(true)                  // '5K.0GZ.919/U001-06'
```

---

## CNPJ alfanumérico (Receita Federal 2026)

A partir de **julho/2026** a Receita Federal passa a emitir CNPJs no formato alfanumérico, conforme [Nota Técnica Conjunta COCAD/SUARA/RFB nº 49/2024](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico). A partir da v2, esta biblioteca valida os dois formatos:

- **Formato legado** (numérico): `12.345.678/0001-95`
- **Formato novo** (alfanumérico): `12.ABC.345/01DE-35`

Os dois últimos dígitos (DVs) permanecem sempre numéricos. A validação usa o algoritmo Módulo 11 oficial com conversão ASCII-48 (`A=17`, `B=18`, ..., `Z=42`).

```ts
// Exemplo canônico publicado pela RFB — pergunta 14 do PDF oficial
cnpj.isValid('12.ABC.345/01DE-35')  // true  (DV1=3, DV2=5)

// Combinações possíveis (pergunta 23 do PDF)
cnpj.isValid('AA.345.678/0001-14')   // raiz alfa, filial numérica
cnpj.isValid('AA.345.678/000A-29')   // raiz alfa, filial alfa
cnpj.isValid('12.345.678/000A-08')   // raiz numérica, filial alfa
```

---

## Geração de CPF por UF (Região Fiscal)

A 9ª posição do CPF codifica a **Região Fiscal** que o emitiu (regra histórica da RFB). A v2 expõe isso via opção `state`:

```ts
cpf.generate({ state: 'SP' })  // sempre produz um CPF terminando em ...8?? (SP = 8ª RF)
cpf.generate({ state: 'RS' })  // sempre produz um CPF terminando em ...0?? (RS = 10ª RF)
```

Mapa UF → Região Fiscal:

| Região Fiscal | Dígito | UFs |
|---|---|---|
| 1ª | 1 | DF, GO, MS, MT, TO |
| 2ª | 2 | AC, AM, AP, PA, RO, RR |
| 3ª | 3 | CE, MA, PI |
| 4ª | 4 | AL, PB, PE, RN |
| 5ª | 5 | BA, SE |
| 6ª | 6 | MG |
| 7ª | 7 | ES, RJ |
| 8ª | 8 | SP |
| 9ª | 9 | PR, SC |
| 10ª | 0 | RS |

Se você passar uma UF inválida, a função lança `TypeError` com a lista de UFs válidas:

```ts
cpf.generate({ state: 'XX' as UF })  // TypeError: UF 'XX' desconhecida — use uma das: DF, GO, MS, ...
```

---

## Adapters

### Joi

```ts
import Joi from 'joi'
import { joiValidator } from 'cpf-cnpj-validator/joi'

const joi = Joi.extend(joiValidator)

const schema = joi.object({
  cpf: joi.document().cpf().required(),
  cnpj: joi.document().cnpj().required()
})

await schema.validateAsync({ cpf: '295.379.955-93', cnpj: '12ABC34501DE35' })

// Mensagem customizada inline (padrão consistente entre os 4 adapters):
joi.document().cpf('CPF precisa ser válido!').required()
joi.document().cnpj('CNPJ obrigatório').required()
```

### Yup

```ts
import * as yup from 'yup'
import { yupValidator } from 'cpf-cnpj-validator/yup'

yupValidator(yup)   // uma única vez no bootstrap

const schema = yup.object({
  cpf: yup.string().cpf('CPF precisa ser válido').required(),
  cnpj: yup.string().cnpj().required()
})

await schema.validate({ cpf: '295.379.955-93', cnpj: '12ABC34501DE35' })
```

### Zod

```ts
import { z } from 'zod'
import { zodValidator } from 'cpf-cnpj-validator/zod'

const { cpf: zCpf, cnpj: zCnpj } = zodValidator(z)

const User = z.object({
  cpf: zCpf(),
  cnpj: zCnpj('CNPJ é obrigatório e válido').optional()
})

User.parse({ cpf: '295.379.955-93' })
```

### class-validator (NestJS)

```ts
import 'reflect-metadata'
import { IsCPF, IsCNPJ } from 'cpf-cnpj-validator/class-validator'

export class UserDTO {
  @IsCPF()
  cpf!: string

  @IsCNPJ({ message: 'CNPJ deve ser válido' })
  cnpj!: string
}
```

Requer `experimentalDecorators: true` e `emitDecoratorMetadata: true` no `tsconfig.json` (padrão no NestJS).

### Angular Reactive Forms

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { cpfValidator, cnpjValidator } from 'cpf-cnpj-validator/angular'

// Estilo moderno (factory)
const form = new FormGroup({
  cpf: new FormControl('', [Validators.required, cpfValidator()]),
  cnpj: new FormControl('', [cnpjValidator()])
})
```

Também expõe a API estática `AngularValidator.cpf` / `AngularValidator.cnpj` pra uso direto no array de Validators (compatibilidade com o estilo proposto em [#21](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21) por [@rodzappa](https://github.com/rodzappa) em 2020).

---

## API

### `cpf`

| Método | Assinatura | Descrição |
|---|---|---|
| `isValid` | `(value, strict?) => boolean` | Valida CPF. `strict=true` só aceita máscara canônica |
| `strip` | `(value, strict?) => string` | Remove máscara e lixo, retorna dígitos |
| `format` | `(value) => string` | Aplica máscara `XXX.XXX.XXX-XX` |
| `generate` | `(options?) => string` | Gera CPF válido (veja [opções](#opções-de-generate)) |
| `verifierDigit` | `(digits) => number` | Calcula DV Módulo 11 com pesos lineares |

### `cnpj`

| Método | Assinatura | Descrição |
|---|---|---|
| `isValid` | `(value, strict?) => boolean` | Valida CNPJ (numérico ou alfanumérico) |
| `strip` | `(value, strict?) => string` | Remove máscara e lixo |
| `format` | `(value) => string` | Aplica máscara `XX.XXX.XXX/XXXX-YY` |
| `generate` | `(options?) => string` | Gera CNPJ alfanumérico válido |
| `verifierDigit` | `(digits) => number` | Calcula DV Módulo 11 com pesos cíclicos 2..9 |

### Opções de `generate`

```ts
// CPF
cpf.generate(true)                                  // boolean legado = formatted
cpf.generate({ formatted?: boolean; state?: UF })

// CNPJ
cnpj.generate(true)
cnpj.generate({ formatted?: boolean })
```

### Constantes exportadas

```ts
import { cpf } from 'cpf-cnpj-validator'
import type { UF } from 'cpf-cnpj-validator'

cpf.FISCAL_REGION_BY_UF   // mapa completo UF → dígito da Região Fiscal
```

---

## Migração v1 → v2

A v2 tem breaking changes. Aqui está o mapa:

| Antes (v1.x) | Agora (v2) |
|---|---|
| `import validator, { cpf, cnpj } from 'cpf-cnpj-validator'` | `import { joiValidator } from 'cpf-cnpj-validator/joi'` |
| `Joi.extend(validator)` | `Joi.extend(joiValidator)` |
| Node 10+ suportado | **Node 18+ requerido** |
| `@hapi/joi` como dep interna | `joi` como peer opcional |
| Só joi suportado | `joi`, `yup`, `zod`, `class-validator` via subpaths |
| CNPJ puramente numérico | CNPJ numérico **e** alfanumérico (RFB 2026) |
| `cpf.generate(true)` | Continua funcionando + nova API `generate({ formatted, state })` |

Se você usava só `cpf.isValid` / `cnpj.isValid` / `generate`, **não precisa mudar nada** — só fazer upgrade da lib.

Se você usava o `validator` do joi, troque o import:

```diff
- import validator from 'cpf-cnpj-validator'
- const Joi = require('joi').extend(validator)
+ import { joiValidator } from 'cpf-cnpj-validator/joi'
+ import _joi from 'joi'
+ const Joi = _joi.extend(joiValidator)
```

---

## Desenvolvimento

```bash
npm install
npm run test              # roda vitest (98 testes)
npm run test:coverage     # roda com cobertura (100%)
npm run bench             # roda benchmarks
npm run typecheck         # verifica tipos
npm run lint              # biome check
npm run build             # tsup → dist/
npm run check:package     # build + publint + attw
```

---

## Serviços

| Site | Descrição |
|---|---|
| [Simulador oficial RFB](https://www.gov.br/pt-br/servicos/simulador-cnpj-alfanumerico) | Simulador de CNPJ alfanumérico da Receita Federal |

---

## Contribuidores

A biblioteca é mantida por [@carvalhoviniciusluiz](https://github.com/carvalhoviniciusluiz) desde 2018, mas cresceu com contribuições da comunidade ao longo dos anos. Um obrigado especial a:

- [@patrickJramos](https://github.com/patrickJramos) e [@patrick-marvee](https://github.com/patrick-marvee) — implementação do suporte ao novo formato alfanumérico de CNPJ da RFB ([#45](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/45)), que virou o core da v2.0.
- [@rodzappa](https://github.com/rodzappa) — proposta original do adapter Angular ([#21](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21), 2020), incorporada na v2.1 quando a arquitetura permitiu peer deps opcionais.
- [@leandrogehlen](https://github.com/leandrogehlen) — migração de `@hapi/joi` para `joi` oficial e primeira movida de joi para peer dependency ([#23](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/23), [#26](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/26)).
- [@tcelestino](https://github.com/tcelestino) — revisão técnica do algoritmo alfanumérico da RFB e intermediação para destravar a PR #45.
- [@MauricioSilv](https://github.com/MauricioSilv) — exemplos de uso em ES6 no README ([#18](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/18)).
- [@valeriocs](https://github.com/valeriocs) — padronização de métodos de array ([#7](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/7)).
- [@manelferreira](https://github.com/manelferreira) — correção inicial da dependência joi ([#3](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/3)).
- [@andremw](https://github.com/andremw) — fixes de typos no README ([#15](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/15)).

E a todos que abriram issues reportando bugs ou pedindo features — cada contribuição ajuda a lib a servir melhor a comunidade brasileira de desenvolvedores.

---

## Apoie o projeto

Se essa lib te economizou tempo em validação de CPF/CNPJ, considere apoiar o desenvolvimento:

<a href="https://www.buymeacoffee.com/carvalhotech" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy me a coffee" height="40">
</a>

---

## Licença

[MIT](./LICENSE) · Copyright (c) 2018-presente Vinicius Carvalho
