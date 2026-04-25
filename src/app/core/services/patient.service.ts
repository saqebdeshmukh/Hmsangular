import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;

  getAllPatients() {
    return this.http.get<any>(`${this.apiUrl}/patient/getPatients`);
  }
  createPatient(data: any) {
    return this.http.post<any>(`${this.apiUrl}/patient/createPatient`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );;
  }
  updatePatient(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/patient/updatePatient/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getPatientById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/patient/getPatientById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }

  doctorLookup() {
    return this.http.get<any>(`${this.apiUrl}/doctor/getDoctors`);
  }
}