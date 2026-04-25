import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;

  getAppointmentDetails(id: string) {
    return this.http.get<any>(`${this.apiUrl}/appointment/appointmentDetails/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  createAppointment(data: any) {
    return this.http.post<any>(`${this.apiUrl}/appointment/createAppointment`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getAppointments() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetAppointments`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  completeAppointment(id: string,status: string) {
    return this.http.put<any>(`${this.apiUrl}/appointment/completeAppointment/${id}/${status}`, {}).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  deleteAppointment(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/appointment/deleteAppointment/${id}`, {}).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
}