import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private http: HttpClient, private toastr:ToastService) {}
 private apiUrl = environment.apiUrl;

  getAppointmentDetails(id: string) {
    return this.http.get<any>(`${this.apiUrl}/appointment/appointmentDetails/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.info(res.message,"Info");
        return res;
      })
    );
  }
  createAppointment(data: any) {
    return this.http.post<any>(`${this.apiUrl}/appointment/createAppointment`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getAppointments() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetAppointments`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  completeAppointment(id: string,status: string) {
    return this.http.put<any>(`${this.apiUrl}/appointment/updateAppointmentStatus/${id}/${status}`, {}).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  deleteAppointment(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/appointment/deleteAppointment/${id}`, {}).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
   getAppointmentCalednar(month: number, year:number) {
    return this.http.get<any>(`${this.apiUrl}/appointment/Calendar/${month}/${year}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
}