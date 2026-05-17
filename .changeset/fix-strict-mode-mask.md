---
'cpf-cnpj-validator': patch
---

fix(cpf,cnpj): strict mode agora rejeita máscara malformada

`cpf.isValid` e `cnpj.isValid` em modo strict passam a validar o shape canônico antes de stripar a máscara. Entradas com pontos, barras ou hífens duplicados/em posição errada (ex: `'12......ABC.345/01DE-35'`) agora retornam `false` mesmo quando o cálculo do DV após o strip conferiria.

Aceitos em strict:

- Máscara canônica RFB: `XXX.XXX.XXX-XX` (CPF) e `XX.XXX.XXX/XXXX-YY` (CNPJ)
- 11 dígitos crus (CPF) ou 14 caracteres `[0-9A-Z]{12}\d{2}` (CNPJ)

Modo loose (`strict` omitido ou `false`) permanece inalterado. Comportamento de `strip` em strict também permanece inalterado — apenas `isValid` ganhou a validação prévia do shape.

Fecha [#51](https://github.com/carvalhoviniciusluiz/cpf-cnpj-validator/issues/51).
