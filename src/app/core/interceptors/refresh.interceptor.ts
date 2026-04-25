import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.services';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        return auth.refreshToken().pipe(

          switchMap((res: any) => {

            auth.setSession(res.token, res.refreshToken);

            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`
              }
            });

            return next(newReq);
          })
        );
      }

      return throwError(() => error);
    })
  );
};