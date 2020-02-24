# cpf-cnpj-validator
Valida e formata strings de CPF ou CNPJ.

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

### Requer:
Node ``^8.0.0``.

@hapi/joi ``^17.1.0``.

### Uso:

```js
const { cpf } = require('cpf-cnpj-validator');

// gera um número de cpf
const num = cpf.generate();
// #=> 25634428777

// verifica se é um número válido
cpf.isValid(num);
// #=> true

// formata o número gerado
cpf.format(num);
// #=> 256.344.287-77
```

__NOTE__: os módulos de cpf e cnpj possuem métodos nomeados de forma igual diferindo se apenas os resultados.

```js
const { cnpj } = require('cpf-cnpj-validator');

// gera um número de cpnj
const num = cnpj.generate();
// #=> 58403919000106

// verifica se é um número válido
cnpj.isValid(num);
// #=> true

// formata o número gerado
cnpj.format(num);
// #=> 58.403.919/0001-06
```

Veja mais exemplos práticos consultando os testes para [CPF](./test/cpf.test.ts) e [CNPJ.](./test/cpf.test.ts)

### Joi

[@hapi/joi](https://www.npmjs.com/package/@hapi/joi) é uma excelente biblioteca para validação de objetos javascript que permite a construção de mecanismos personalizados para tal.
A biblioteca [cpf-cnpj-validator](https://www.npmjs.com/package/cpf-cnpj-validator) disponibiliza um mecanismo personalizado para Joi capas de validar se uma string pode ser, ou não, um número válido de CPF ou CNPJ:

```js
const validator = require('cpf-cnpj-validator')
// or
// const { validator } = require('cpf-cnpj-validator')
//
const Joi = require('@hapi/joi').extend(validator)

const cnpjSchema = Joi.document().cnpj();
const cpfSchema = Joi.document().cpf();

// valida o CPF
Joi.validate('54271113107', cpfSchema);
// #=> true

// valida o CNPJ
Joi.validate('38313108000107', cnpjSchema);
// #=> true
```

Maiores informações podem ser obtidas com os testes de [validação 1](./test/validator.1.test.ts) e [validação 2](./test/validator.2.test.ts).

### Tests
```shell
npm test
```
## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present
