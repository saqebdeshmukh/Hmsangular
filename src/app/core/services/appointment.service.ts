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
  getAppointments(request: any = {}) {
    return this.http.post<any>(`${this.apiUrl}/appointment/GetAppointments`, request).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getTodaysAppointments() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetTodayAppointments`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  getUpcomingAppointments() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetUpcomingAppointments`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  getCompletedAppointments() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetCompletedAppointments`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  updateAppointmentStatus(id: string,status: string) {
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

  getAppointmentsToSelect() {
    return this.http.get<any>(`${this.apiUrl}/appointment/GetAppointmentsToSelect`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
}