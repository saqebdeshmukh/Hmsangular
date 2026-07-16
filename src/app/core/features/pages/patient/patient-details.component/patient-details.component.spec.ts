import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../../services/patient.service';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { PrescriptionService } from '../../../../services/prescription.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.services';
import { ToastService } from '../../../../services/toast.service';

import { PatientDetailComponent } from './patient-details.component';

describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;
  let medicalRecordService: jasmine.SpyObj<MedicalRecordService>;
  let prescriptionService: jasmine.SpyObj<PrescriptionService>;

  beforeEach(async () => {
    medicalRecordService = jasmine.createSpyObj('MedicalRecordService', ['getMedicalRecordsByPatientId']);
    prescriptionService = jasmine.createSpyObj('PrescriptionService', ['getPrescriptionsByPatientId']);

    medicalRecordService.getMedicalRecordsByPatientId.and.returnValue(of({ data: [{ id: 1 }] }));
    prescriptionService.getPrescriptionsByPatientId.and.returnValue(of({ data: [{ id: 1 }, { id: 2 }] }));

    await TestBed.configureTestingModule({
      imports: [PatientDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        {
          provide: PatientService,
          useValue: {
            getPatientDetails: jasmine.createSpy().and.returnValue(of({ data: { id: '123', patientName: 'Test Patient', appointments: [] } })),
            doctorLookup: jasmine.createSpy().and.returnValue(of({ data: [] })),
          },
        },
        { provide: MedicalRecordService, useValue: medicalRecordService },
        { provide: PrescriptionService, useValue: prescriptionService },
        { provide: AppointmentService, useValue: {} },
        { provide: AuthService, useValue: { user: () => ({ role: 'Admin' }) } },
        { provide: ToastService, useValue: { error: jasmine.createSpy(), success: jasmine.createSpy(), warning: jasmine.createSpy() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads medical records and prescriptions on init', () => {
    expect(medicalRecordService.getMedicalRecordsByPatientId).toHaveBeenCalledWith('123');
    expect(prescriptionService.getPrescriptionsByPatientId).toHaveBeenCalledWith('123');
    expect(component.medicalRecords().length).toBe(1);
    expect(component.prescriptions().length).toBe(2);
  });
});
