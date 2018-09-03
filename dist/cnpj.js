"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BLACKLIST = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999'
];
const STRICT_STRIP_REGEX = /[-\\/.]/g;
const LOOSE_STRIP_REGEX = /[^\d]/g;
exports.verifierDigit = (digits) => {
    let index = 2;
    const reverse = digits.split('').reduce((buffer, number) => {
        return [parseInt(number, 10)].concat(buffer);
    }, []);
    const sum = reverse.reduce((buffer, number) => {
        buffer += number * index;
        index = (index === 9 ? 2 : index + 1);
        return buffer;
    }, 0);
    const mod = sum % 11;
    return (mod < 2 ? 0 : 11 - mod);
};
exports.strip = (number, strict) => {
    const regex = strict ? STRICT_STRIP_REGEX : LOOSE_STRIP_REGEX;
    return (number || '').toString().replace(regex, '');
};
exports.format = (number) => {
    return exports.strip(number).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};
exports.isValid = (number, strict) => {
    const stripped = exports.strip(number, strict);
    if (!stripped) {
        return false;
    }
    if (stripped.length !== 14) {
        return false;
    }
    if (BLACKLIST.includes(stripped)) {
        return false;
    }
    let numbers = stripped.substr(0, 12);
    numbers += exports.verifierDigit(numbers);
    numbers += exports.verifierDigit(numbers);
    return numbers.substr(-2) === stripped.substr(-2);
};
exports.generate = (formatted) => {
    let numbers = '';
    for (let i = 0; i < 12; i += 1) {
        numbers += Math.floor(Math.random() * 9);
    }
    numbers += exports.verifierDigit(numbers);
    numbers += exports.verifierDigit(numbers);
    return (formatted ? exports.format(numbers) : numbers);
};
