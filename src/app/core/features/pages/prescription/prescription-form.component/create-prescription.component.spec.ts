import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CreatePrescriptionComponent } from './create-prescription.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';

describe('CreatePrescriptionComponent', () => {
  let component: CreatePrescriptionComponent;
  let fixture: ComponentFixture<CreatePrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePrescriptionComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '123' })
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: PrescriptionService,
          useValue: {}
        },
        {
          provide: MedicalRecordService,
          useValue: {
            getMedicalRecordByIdForPres: () => of({ isSuccess: true, data: { id: 1 } })
          }
        },
        {
          provide: ToastService,
          useValue: {
            success: jasmine.createSpy('success'),
            error: jasmine.createSpy('error'),
            warning: jasmine.createSpy('warning')
          }
        },
        {
          provide: AppointmentService,
          useValue: {
            createAppointment: jasmine.createSpy('createAppointment').and.returnValue(of({ isSuccess: true }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePrescriptionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should allow appointment creation when the selected date is not today', () => {
    expect(component['shouldCreateAppointment']('2026-07-16')).toBeTrue();
  });

  it('should skip appointment creation when the selected date is today', () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60000);
    const dateString = localToday.toISOString().slice(0, 10);

    expect(component['shouldCreateAppointment'](dateString)).toBeFalse();
  });
});
