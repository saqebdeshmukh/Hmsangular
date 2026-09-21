import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { map } from 'rxjs';
import { ToastService } from './toast.service';
import { GridRequest } from '../GridRequestResponse/gridRequestResponse';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private http: HttpClient, private toastr:ToastService) {}
 private apiUrl = environment.apiUrl;

  getAllPatients(request: GridRequest) {
    return this.http.post<any>(`${this.apiUrl}/patient/getPatients`, request).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  createPatient(data: any) {
    return this.http.post<any>(`${this.apiUrl}/patient/createPatient`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );;
  }
  updatePatient(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/patient/updatePatient/${id}`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }
  getPatientById(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/patient/getPatientById/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  getPatientDetails(id: string | null) {
    return this.http.get<any>(`${this.apiUrl}/patient/PatientDetails/${id}`).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );
  }

  

  doctorLookup() {
    return this.http.get<any>(`${this.apiUrl}/doctor/getDoctors`);
  }

  getGeneticDiseases() {
    return this.http.get<any>(`${this.apiUrl}/geneticDisease/getGeneticDiseases`);
  }
  CreateGeneticDisease(data: any) {
    return this.http.post<any>(`${this.apiUrl}/geneticDisease/createGeneticDisease`, data).pipe(
      map(res => {
        if (!res.isSuccess) this.toastr.warning(res.message,"Warning");
        return res;
      })
    );;
  }
}