import { Routes } from '@angular/router';
import { HomepageComponent } from './core/features/public/homepage-component/homepage-component';
import { LoginComponent } from './core/features/auth/login-component/login-component';
import { RegisterComponent } from './core/features/auth/register-component/register-component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [


//   // 🌐 Public
//   { path: '', component: HomeComponent },
   { path: 'login', component: LoginComponent },
   { path: 'register', component: RegisterComponent },

    // 🔒 Admin

{
    path: 'admin',
    loadComponent: () =>
      import('./core/features/dashboard/admin-dash-component/admin-dash-component')
      .then(m => m.AdminDashComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },

 // 🔒 Patients

  {
    path: 'patients',
    loadComponent: () =>
      import('./core/features/pages/patient/patient-list.component/patient-list.component')
      .then(m => m.PatientListComponent)
  },

  {
  path: 'patients/create',
  loadComponent: () => import('./core/features/pages/patient/patient-form-component/create-patient.component').then(m => m.CreatePatientComponent)
},
{
  path: 'patients/edit/:id',
  loadComponent: () => import('./core/features/pages/patient/patient-form-component/edit-patient.component').then(m => m.EditPatientComponent)
},
{
  path: 'patientdetails/:id',
  loadComponent: () =>
    import('./core/features/pages/patient/patient-details.component/patient-details.component')
      .then(m => m.PatientDetailComponent)
},

 // 🔒 Doctor

{
    path: 'doctordashboard',
    loadComponent: () =>
      import('./core/features/dashboard/doctor-dash-component/doctor-dash-component')
      .then(m => m.DoctorDashComponent),
    canActivate: [authGuard],
    data: { roles: ['Doctor'] }
  },
{
path: 'medicines',
  loadComponent: () => import('./core/features/pages/medicines.component/medicines.component')
  .then(m => m.MedicinesComponent)
},
{
    path: 'doctors',
    loadComponent: () =>
      import('./core/features/pages/doctor/doctor-list.component/doctor-list.component')
      .then(m => m.DoctorListComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
{
  path: 'doctor/create',
  loadComponent: () => import('./core/features/pages/doctor/doctor-form-component/doctor-form-component').then(m => m.DoctorFormComponent)
},

{
  path: 'doctor/edit/:id',
  loadComponent: () => import('./core/features/pages/doctor/doctor-form-component/doctor-form-component').then(m => m.DoctorFormComponent)
},
{
  path: 'doctor/:id',
  loadComponent: () =>
    import('./core/features/pages/doctor/doctor-details.component/doctor-details.component')
      .then(m => m.DoctorDetailsComponent)
},

 // 🔒 Receptionist

 {
    path: 'receptionistdashboard',
    loadComponent: () =>
      import('./core/features/dashboard/recep-dash-component/recep-dash-component')
      .then(m => m.RecepDashComponent),
    canActivate: [authGuard],
    data: { roles: ['Receptionist'] }
  },

 {
    path: 'receptionists',
    loadComponent: () =>
      import('./core/features/pages/receptionist/receptionist.component/receptionist.component')
      .then(m => m.ReceptionistComponent),
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Doctor'] }
  },
   {
  path: 'receptionist/create',
  loadComponent: () => import('./core/features/pages/receptionist/create-receptionist.component/create-receptionist.component')
  .then(m => m.CreateReceptionistComponent)
},

// 🔒 Appointments
{
path: 'appointments',
  loadComponent: () => import('./core/features/pages/appointment/appointments.component/appointments.component')
  .then(m => m.AppointmentsComponent)
},

{
  path: 'appointmentDetails/:id',
  loadComponent: () =>
    import('./core/features/pages/appointment/appointment-details.component/appointment-details.component')
      .then(m => m.AppointmentDetailsComponent)
},
{
  path: 'appointments/calendar',
  loadComponent: () =>
    import('./core/features/pages/appointment/calendar.component/calendar.component')
      .then(m => m.AppointmentCalendarComponent)
},

// 🔒 Medical Records
{
path: 'medical-records',
  loadComponent: () => import('./core/features/pages/medicalrecord/medical-records.component/medical-records.component')
  .then(m => m.MedicalRecordsComponent)
},

{
  path: 'medical-records/create',
  loadComponent: () =>
    import('./core/features/pages/medicalrecord/select-appointment.component/select-appointment.component')
      .then(m => m.SelectAppointmentComponent)
},
{
  path: 'medical-records/create/:appointmentId',
  loadComponent: () =>
    import('./core/features/pages/medicalrecord/medical-record-form.component/create-medical-record.component')
      .then(m => m.CreateMedicalRecordComponent)
},
{
  path: 'medical-records/edit/:id',
  loadComponent: () => import('./core/features/pages/medicalrecord/medical-record-form.component/edit-medical-record.component')
  .then(m => m.EditMedicalRecordComponent)
},
{
  path: 'medical-records/details/:id',
  loadComponent: () =>
    import('./core/features/pages/medicalrecord/medical-record-details.component/medical-record-details.component')
      .then(m => m.MedicalRecordDetailsComponent)
},

// 🔒 Prescription
{
  path: 'prescriptions',
  loadComponent: () =>
    import('./core/features/pages/prescription/prescription-list.component/prescription-list.component')
      .then(m => m.PrescriptionListComponent)
},
{
  path: 'prescriptions/:doctorId',
  loadComponent: () =>
    import('./core/features/pages/prescription/prescription-list.component/prescription-list.component')
      .then(m => m.PrescriptionListComponent)
},
{
  path: 'prescription/create',
  loadComponent: () => import('./core/features/pages/prescription/select-medical-record.component/select-medical-record.component')
  .then(m => m.SelectMedicalRecordComponent)
},
{
  path: 'prescription/create/:recordId',
  loadComponent: () => import('./core/features/pages/prescription/prescription-form.component/create-prescription.component')
  .then(m => m.CreatePrescriptionComponent)
},
{
  path: 'prescription/edit/:id',
  loadComponent: () => import('./core/features/pages/prescription/prescription-form.component/edit-prescription.component')
  .then(m => m.EditPrescriptionComponent)
},
{
  path: 'prescriptiondetails/:id',
  loadComponent: () =>
    import('./core/features/pages/prescription/prescription-details.component/prescription-details.component')
      .then(m => m.PrescriptionDetailsComponent)
},
{
  path: 'prescriptionprint/:id',
  loadComponent: () =>
    import('./core/features/pages/prescription/prescription-print.component/prescription-print.component')
      .then(m => m.PrescriptionPrintComponent),
      data: { hideLayout: true }
},
{
  path:'healthreport/:patientId',
  loadComponent: () =>
    import('./core/features/pages/healthreport/health-report.component/health-report.component')
      .then(m => m.HealthReportComponent)
},

//   // ❌ Unauthorized
   { path: '' , component: HomepageComponent },

//   { path: '**', redirectTo: '' }
 ];