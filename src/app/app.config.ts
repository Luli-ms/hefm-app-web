import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment.prod';
import { provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';
import { provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling(
        {
          anchorScrolling: 'enabled',
          scrollPositionRestoration: 'enabled'
        }
      )
    ),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore('users-prods-db')),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
  ]
};
