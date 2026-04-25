import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;

  getAllDoctors() {
    return this.http.get<any>(`${this.apiUrl}/doctor/getDoctors`);
  }
  createDoctor(data: any) {
    return this.http.post<any>(`${this.apiUrl}/doctor/createDoctor`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );;
  }
  updateDoctor(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/doctor/updateDoctor/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getDoctorById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/doctor/getDoctorById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getDoctorAppointmentsById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetAppointmentsByDoctorId/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
}