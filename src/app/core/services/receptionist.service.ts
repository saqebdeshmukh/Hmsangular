import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReceptionistService {
  constructor(private http: HttpClient) {}
 private apiUrl = environment.apiUrl;

  getAllReceptionists() {
    return this.http.get<any>(`${this.apiUrl}/receptionist/Receptionists`);
  }
  createReceptionist(data: any) {

    return this.http.post<any>(`${this.apiUrl}/receptionist/createReceptionist`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );;
  }
  updateReceptionist(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/receptionist/updateReceptionist/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
  getReceptionistById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/receptionist/getReceptionistById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }

  doctorLookup() {
    return this.http.get<any>(`${this.apiUrl}/doctor/getDoctors`);
  }
  createAppointment(data: any) {
    return this.http.post<any>(`${this.apiUrl}/appointment/createAppointment`, data).pipe(
      map(res => {
        if (!res.isSuccess) throw new Error(res.message);
        return res;
      })
    );
  }
}