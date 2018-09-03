"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const Joi = __importStar(require("joi"));
const cpf = __importStar(require("./cpf"));
const cnpj = __importStar(require("./cnpj"));
module.exports = {
    base: Joi.string(),
    name: 'document',
    language: {
        cnpj: 'informado é inválido',
        cpf: 'informado é inválido'
    },
    rules: [{
            name: 'cnpj',
            validate(_params, value, state, options) {
                if (!cnpj.isValid(value)) {
                    return this.createError('document.cnpj', { v: value }, state, options);
                }
                return value;
            }
        }, {
            name: 'cpf',
            validate(_params, value, state, options) {
                if (!cpf.isValid(value)) {
                    return this.createError('document.cpf', { v: value }, state, options);
                }
                return value;
            }
        }]
};
