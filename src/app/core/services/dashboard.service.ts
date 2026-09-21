import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;

  getDashboardData() {
    return this.http.get<any>(`${this.apiUrl}/dashboard/admindashboard`);
  }
  getDoctorDashboardData() {
    return this.http.get<any>(`${this.apiUrl}/dashboard/doctorDashboard`);
  }
  getReceptionistDashboardData() {
    return this.http.get<any>(`${this.apiUrl}/dashboard/receptionistDashboard`);
  }
  getIdToRedirect(appointmentId: string) {
    return this.http.get<any>(`${this.apiUrl}/dashboard/getIdToRedirect/${appointmentId}`);
  }
  getInternalPrescriptions() {
    return this.http.get<any>(`${this.apiUrl}/dashboard/getInternalPrescriptionsforDashboard`);
  }
}