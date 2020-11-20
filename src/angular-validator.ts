import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isValidCpf } from './cpf';
import { isValidCnpj } from './cnpj';

type ValidatorReturnType = { [key: string]: any } | null;

export class AngularValidator {
    static cpf(control: AbstractControl): any | null {
        return AngularValidator.cpfValidator()(control);
    }

    static cnpj(control: AbstractControl): any | null {
        return AngularValidator.cnpjValidator()(control);
    }

    private static cpfValidator(): ValidatorFn {
        return (control: AbstractControl): ValidatorReturnType => {
            if (!!control.value && isValidCpf(control.value, true)) {
                return null;
            }
            return { cpf: control.value };
        };
    }

    private static cnpjValidator(): ValidatorFn {
        return (control: AbstractControl): ValidatorReturnType => {
            if (!!control.value && isValidCnpj(control.value, true)) {
                return null;
            }
            return { cnpj: control.value };
        };
    }
}
