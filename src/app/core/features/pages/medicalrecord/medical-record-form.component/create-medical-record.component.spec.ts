import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateMedicalRecordComponent } from './create-medical-record.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentStatus } from '../../appointmentStatus.enum';

describe('CreateMedicalRecordComponent', () => {
  let component: CreateMedicalRecordComponent;
  let fixture: ComponentFixture<CreateMedicalRecordComponent>;
  let medicalRecordService: jasmine.SpyObj<MedicalRecordService>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    medicalRecordService = jasmine.createSpyObj('MedicalRecordService', ['createMedicalRecord']);
    appointmentService = jasmine.createSpyObj('AppointmentService', ['updateAppointmentStatus']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateMedicalRecordComponent],
      providers: [
        { provide: MedicalRecordService, useValue: medicalRecordService },
        { provide: AppointmentService, useValue: appointmentService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'appt-1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMedicalRecordComponent);
    component = fixture.componentInstance;
    component.appointment.set({ id: 'appt-1', patientId: 'p1', doctorId: 'd1' });
    medicalRecordService.createMedicalRecord.and.returnValue(of({ isSuccess: true, message: 'created', data: 42 }));
    appointmentService.updateAppointmentStatus.and.returnValue(of({ isSuccess: true, message: 'completed' }));
  });

  it('should create the record and mark the appointment as completed when save and complete is used', () => {
    component.create({ id: null, appointmentId: 'appt-1', patientId: 'p1', doctorId: 'd1', isComplete: true });

    expect(medicalRecordService.createMedicalRecord).toHaveBeenCalled();
    expect(appointmentService.updateAppointmentStatus).toHaveBeenCalledWith('appt-1', AppointmentStatus.Completed);
  });
});
