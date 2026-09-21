import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  constructor(private http: HttpClient, private toastr:ToastService) {}
 private apiUrl = environment.apiUrl;
getMedicalRecords(request: any = {}) {
    return this.http.post<any>(`${this.apiUrl}/medicalrecord/GetMedicalRecords`, request).pipe(
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

  getMedicalHistory(patientId: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getMedicalHistory/${patientId}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  getMedicalRecordByIdForPres(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getMedicalRecordByIdForPres/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getMedicalRecordsByPatientId(patientId: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getMedicalRecordsByPatientId/${patientId}`).pipe(
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
  getHealthReport(patientId: string | null,request: any = {}) {
    return this.http.post<any>(`${this.apiUrl}/medicalrecord/getHealthReport/${patientId}`,request).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  duplicateRecord(medicalRecordId: string | null, appointmentId: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/duplicateRecord/${medicalRecordId}/${appointmentId}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  addAllergy(data: { patientId: string | number; allergyName: string }) {
    return this.http.post<any>(`${this.apiUrl}/medicalrecord/CreatePatientAllergy`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  removeAllergy(data: { allergyId: number; patientId: string }) {
  const params = new HttpParams()
    .set('allergyId', data.allergyId.toString())
    .set('patientId', data.patientId);

  return this.http.delete<any>(
    `${this.apiUrl}/medicalrecord/RemovePatientAllergy`,
    { params }
  ).pipe(
    map(res => {
      if (!res.isSuccess) {
        this.toastr.warning(
          res.message || 'Patient allergy not found',
          'Warning'
        );
      }

      return res;
    })
  );
}
  getAllergiesByPatientId(patientId: string | null) {
    return this.http.get<any>(`${this.apiUrl}/medicalrecord/getAllergiesByPatientId/${patientId}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
}