import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class LoaderService {

  private requestCount = 0;

  constructor(private spinner: NgxSpinnerService) {}

  show() {
    this.requestCount++;
    this.spinner.show();
  }

  hide() {
    this.requestCount--;

    if (this.requestCount <= 0) {
      this.spinner.hide();
      this.requestCount = 0;
    }
  }
}