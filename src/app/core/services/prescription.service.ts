import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';
import { GridRequest } from '../GridRequestResponse/gridRequestResponse';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private http: HttpClient, private toastr: ToastService) { }
  private apiUrl = environment.apiUrl;
  getPrescriptions(request:GridRequest | null) {
    if (request) {
      return this.http.post<any>(`${this.apiUrl}/Prescription/Prescriptions`, request).pipe(
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
  getPrescriptionByIdForPrint(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/prescription/getPrescriptionByIdForPrint/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
   getPrescriptionsByPatientId(patientId: string | null) {
    return this.http.get<any>(`${this.apiUrl}/prescription/getPrescriptionsByPatientId/${patientId}`).pipe(
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
   getSearchedMedicine(searchTerm: string) {
    return this.http.get<any>(`${this.apiUrl}/medicines/getSearchedMedicines/${searchTerm}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
  getInternalPrescriptions(request:GridRequest | null) {
    if (request) {
      return this.http.post<any>(`${this.apiUrl}/prescription/internalPrescriptions`, request)
        .pipe(
          map(res => {
            if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
            return res;
          })
        );
    }
    return this.http.get<any>(`${this.apiUrl}/Prescription/internalPrescriptions`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
   getExternalPrescriptions(request:GridRequest | null) {
    if (request) {
      return this.http.post<any>(`${this.apiUrl}/prescription/externalPrescriptions`, request)
        .pipe(
          map(res => {
            if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
            return res;
          })
        );
    }
    return this.http.get<any>(`${this.apiUrl}/Prescription/externalPrescriptions`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message, "Warning");
        return res;
      })
    );
  }
}