import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';
import { STRINGS, StringKey } from './strings';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
    private locale = inject(LocaleService);

    transform(key: StringKey): string {
        const dict = STRINGS[this.locale.lang()];
        return (dict as Record<string, string>)[key] ?? key;
    }
}
