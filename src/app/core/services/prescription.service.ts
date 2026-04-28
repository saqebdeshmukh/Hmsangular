import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private http: HttpClient, private toastr: ToastService) { }
  private apiUrl = environment.apiUrl;
  getPrescriptions(doctorId?: string | null) {
    if (doctorId) {
      return this.http.get<any>(`${this.apiUrl}/Prescription/Prescriptions/${doctorId}`)
        .pipe(
          map(res => {
            if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
            return res;
          })
        );
    }

    return this.http.get<any>(`${this.apiUrl}/Prescription/Prescriptions`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );


  }
  createPrescription(data: any) {
    return this.http.post<any>(`${this.apiUrl}/prescription/createPrescription`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );;
  }
  updatePrescription(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/prescription/updatePrescription/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
  getPrescriptionById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/prescription/getPrescriptionById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
  getPrescriptionDetails(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/prescription/PrescriptionDetails/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
}