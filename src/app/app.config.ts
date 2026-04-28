import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';


import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { authInterceptor } from './core/services/auth.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
    authInterceptor,
    refreshInterceptor,
    loadingInterceptor,
    errorInterceptor
  ])),

   
       provideAnimations(),

    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    }),

    importProvidersFrom(
      NgxSpinnerModule.forRoot({
        type: 'ball-spin-clockwise',
      })
      
    )
  ]
};
