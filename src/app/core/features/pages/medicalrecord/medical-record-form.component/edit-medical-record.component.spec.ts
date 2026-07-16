import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EditMedicalRecordComponent } from './edit-medical-record.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentStatus } from '../../appointmentStatus.enum';

describe('EditMedicalRecordComponent', () => {
  let component: EditMedicalRecordComponent;
  let fixture: ComponentFixture<EditMedicalRecordComponent>;
  let medicalRecordService: jasmine.SpyObj<MedicalRecordService>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    medicalRecordService = jasmine.createSpyObj('MedicalRecordService', ['updateMedicalRecord']);
    appointmentService = jasmine.createSpyObj('AppointmentService', ['updateAppointmentStatus']);
    toastService = jasmine.createSpyObj('ToastService', ['success']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EditMedicalRecordComponent],
      providers: [
        { provide: MedicalRecordService, useValue: medicalRecordService },
        { provide: AppointmentService, useValue: appointmentService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditMedicalRecordComponent);
    component = fixture.componentInstance;
    medicalRecordService.updateMedicalRecord.and.returnValue(of({ isSuccess: true, message: 'updated' }));
    appointmentService.updateAppointmentStatus.and.returnValue(of({ isSuccess: true, message: 'completed' }));
  });

  it('should update the record and mark the appointment as completed when save and complete is used', () => {
    component.update({ id: 1, appointmentId: 'appt-1', isComplete: true });

    expect(medicalRecordService.updateMedicalRecord).toHaveBeenCalled();
    expect(appointmentService.updateAppointmentStatus).toHaveBeenCalledWith('appt-1', AppointmentStatus.Completed);
  });
});
