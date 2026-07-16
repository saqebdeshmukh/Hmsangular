import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';

export interface MedicineModel {
  name: string;
  dosage: string;
  frequency: number;
  mealTiming: string;
  duration: string;
}

export interface MedicinesRequestModel {
  medicine?: MedicineModel | null;
  excelBase64?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MedicinesService {
    constructor(private http: HttpClient, private toastr:ToastService) {}
 private apiUrl = environment.apiUrl;

  getAllMedicines() {
    return this.http.get<any>(`${this.apiUrl}/medicines/getAllMedicines`);
  }
  createMedicine(request: MedicinesRequestModel) {
    return this.http.post<any>(`${this.apiUrl}/medicines/createMedicine`, request).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  updateMedicine(id: string, request: MedicinesRequestModel) {
    return this.http.put<any>(`${this.apiUrl}/medicines/updateMedicine/${id}`, request).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getMedicineById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicines/getMedicineById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  deleteMedicine(id: string | null) {
    return this.http.delete<any>(`${this.apiUrl}/medicines/deleteMedicine/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
}