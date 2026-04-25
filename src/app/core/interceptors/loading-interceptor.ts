import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, catchError, throwError } from 'rxjs';

import { LoaderService } from '../services/loader.service';
import { ToastService } from '../services/toast.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const loader = inject(LoaderService);
  const toast = inject(ToastService);

  loader.show();

  return next(req).pipe(

    catchError((error) => {

      const message =
        error?.error?.message ||
        error?.statusText ||
        'Something went wrong';

      toast.error(message);

      return throwError(() => error);
    }),

    finalize(() => loader.hide())
  );
};