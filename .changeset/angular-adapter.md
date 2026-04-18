---
'cpf-cnpj-validator': minor
---

## Angular adapter (v2.1.0)

Adiciona `cpf-cnpj-validator/angular` — adapter nativo para Angular Reactive Forms, fechando um pedido de 6 anos.

**API moderna (idiomática Angular 17+)**:

```ts
import { cpfValidator, cnpjValidator } from 'cpf-cnpj-validator/angular'

new FormGroup({
  cpf: new FormControl('', [Validators.required, cpfValidator()]),
  cnpj: new FormControl('', [cnpjValidator()])
})
```

**API legada (estilo classe)**:

```ts
import { AngularValidator } from 'cpf-cnpj-validator/angular'

new FormControl('', [AngularValidator.cpf, AngularValidator.cnpj])
```

Ambas aceitam CNPJ alfanumérico (NT RFB 49/2024). Peer dep `@angular/forms >=15` opcional — consumidores não-Angular não são afetados.

### Créditos

Proposta original: [PR #21](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/pull/21) de [@rodzappa](https://github.com/rodzappa) em nov/2020. A implementação ficou em standby por 6 anos porque adicionava `@angular/*` + `rxjs` como `dependencies` diretas, forçando ~10 MB de Angular em todo consumidor. A v2 trouxe a arquitetura de peer deps opcionais + subpath exports que permitiu trazer a ideia de volta com custo zero pra quem não usa Angular. Obrigado Rodolfo pela ideia!
