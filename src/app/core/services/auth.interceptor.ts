import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';

import { inject } from '@angular/core';
import { AuthService } from './auth.services';

import {
  catchError,
  switchMap,
  throwError,
  Observable
} from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn =
  (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

    const auth = inject(AuthService);
    const token = auth.getToken();

    let authReq = req;

    // ✅ Attach token
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next(authReq).pipe(

      catchError((error): Observable<HttpEvent<any>> => {

        // ✅ Handle 401 (token expired)
        if (error.status === 401 && !isRefreshing) {

          isRefreshing = true;

          return auth.refreshToken().pipe(

            switchMap((res: any): Observable<HttpEvent<any>> => {

              isRefreshing = false;

              auth.setSession(res.token, res.refreshToken);

              // 🔁 Retry request
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`
                }
              });

              return next(newReq);
            }),

            catchError((err): Observable<HttpEvent<any>> => {

              isRefreshing = false;

              auth.logout();

              return throwError(() => err);
            })
          );
        }

        return throwError(() => error);
      })
    );
  };