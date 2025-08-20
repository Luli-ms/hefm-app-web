import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'groupDigits'
})
export class GroupDigitsPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) return '';
        const str = value.toString().replace(/\s+/g, ''); // quitar espacios
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}