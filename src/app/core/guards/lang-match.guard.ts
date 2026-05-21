import { CanMatchFn, UrlSegment } from '@angular/router';

/**
 * CanMatch guard for the `:lang` route parameter.
 * Only accepts `es` or `en` — anything else falls through to the wildcard.
 */
export const langMatchGuard: CanMatchFn = (_route, segments: UrlSegment[]) => {
    const first = segments[0]?.path;
    return first === 'es' || first === 'en';
};
