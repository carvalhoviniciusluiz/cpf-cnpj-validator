# cpf-cnpj-validator
Valida o formato de CPF e CNPJ com o Joi.

[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]

[travis-image]: https://travis-ci.org/carvalhoviniciusluiz/cpf-cnpj-validator.svg?branch=master
[travis-url]: https://travis-ci.org/carvalhoviniciusluiz/cpf-cnpj-validator
[npm-image]: https://img.shields.io/npm/v/cpf-cnpj-validator.svg?style=flat
[npm-url]: https://npmjs.org/package/cpf-cnpj-validator

### Instalação:
```
npm i cpf-cnpj-validator -S
```

### Note:
Requer Node ``>8.0.0``.

### Uso:

```js
const Joi = require('joi').extend(require('cpf-cnpj-validator'));

const cnpjSchema = Joi.document().cnpj();
const cpfSchema = Joi.document().cpf();

// Valida o CNPJ
Joi.validate('38313108000107', cnpjSchema);

// Valida o CPF
Joi.validate('54271113107', cpfSchema);
```
__NOTE__: Você pode usar a validação individual dos módulos de CPF e CNPJ
```js
const cpf = require('cpf-cnpj-validator/cpf');

// Gera um número
const num = cpf.generate();

// Verifica se é um número válido
cpf.isValid(num);
```
Para maiores exemplos do [módulo de CPF](./test/cpf.test.ts) ou do [módulo de CNPJ](./test/cpf.test.ts) consulte os tests.

### Tests
```shell
npm test
```
## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018-present
