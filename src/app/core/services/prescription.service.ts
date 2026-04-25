import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;
getPrescriptions(doctorId?:string | null) {
    if (doctorId) {
    return this.http.get<any>(`${this.apiUrl}/Prescription/Prescriptions/${doctorId}`)
    .pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }

  return this.http.get<any>(`${this.apiUrl}/Prescription/Prescriptions`).pipe(
    map(res => {
      if (!res.isSuccess) throw new Error(res.message);
      return res;
    })
  );

      
  }
  createPrescription(data: any) {
    return this.http.post<any>(`${this.apiUrl}/prescription/createPrescription`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );;
  }
  updatePrescription(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/prescription/updatePrescription/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getPrescriptionById(id: string | null) {
      return this.http.get<any>(`${this.apiUrl}/prescription/getPrescriptionById/${id}`).pipe(
        map(res => {
          if (!res.isSuccess) throw new Error(res.message);
          return res;
        })
      );
    }
}