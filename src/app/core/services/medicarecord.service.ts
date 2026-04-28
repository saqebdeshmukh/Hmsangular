import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  constructor(private http: HttpClient, private toastr:ToastService) {}
 private apiUrl = environment.apiUrl;
getMedicalRecords() {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/GetMedicalRecords`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  createMedicalRecord(data: any) {
    return this.http.post<any>(`${this.apiUrl}/medicalrecord/createMedicalRecord`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );;
  }
  updateMedicalRecord(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/medicalrecord/updateMedicalRecord/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getMedicalRecordById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getMedicalRecordById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getMedicalRecordForEdit(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getMedicalRecordForEdit/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
}