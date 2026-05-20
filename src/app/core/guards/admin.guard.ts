import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export const ADMIN_KEY_STORAGE = 'adagioz_admin_key';

async function verifyKey(http: HttpClient, key: string): Promise<boolean> {
  try {
    const headers = new HttpHeaders().set('x-admin-key', key);
    await firstValueFrom(
      http.get(`${environment.apiUrl}/admin/verify`, { headers })
    );
    return true;
  } catch {
    return false;
  }
}

export const adminGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const http = inject(HttpClient);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const stored = localStorage.getItem(ADMIN_KEY_STORAGE);
  if (stored && (await verifyKey(http, stored))) {
    return true;
  }
  if (stored) {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  }

  const entered = window.prompt('Enter admin key to access the config editor:');
  const trimmed = entered?.trim();
  if (!trimmed) {
    return router.parseUrl('/');
  }

  if (await verifyKey(http, trimmed)) {
    localStorage.setItem(ADMIN_KEY_STORAGE, trimmed);
    return true;
  }

  window.alert('Invalid admin key.');
  return router.parseUrl('/');
};
