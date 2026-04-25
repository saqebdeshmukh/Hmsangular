import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const toastr = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      let message = error.error?.message || 'Something went wrong';

      switch (error.status) {

        case 401:
          toastr.error('Session expired');
          localStorage.clear();
          router.navigate(['/login']);
          break;

        case 403:
          toastr.error('Access denied');
          break;

        case 500:
          toastr.error('Server error');
          break;

        default:
          toastr.error(message);
      }

      return throwError(() => error);
    })
  );
};