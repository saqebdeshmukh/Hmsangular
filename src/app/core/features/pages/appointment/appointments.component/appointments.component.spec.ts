import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentsComponent } from './appointments.component';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let service: jasmine.SpyObj<AppointmentService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', [
      'getAppointments',
      'getTodaysAppointments',
      'getUpcomingAppointments',
      'getCompletedAppointments',
      'updateAppointmentStatus',
    ]);

    service.getAppointments.and.returnValue(of({ isSuccess: true, data: { appointments: [] } }));
    service.getTodaysAppointments.and.returnValue(of({ isSuccess: true, data: { appointments: [] } }));
    service.getUpcomingAppointments.and.returnValue(of({ isSuccess: true, data: { appointments: [] } }));
    service.getCompletedAppointments.and.returnValue(of({ isSuccess: true, data: { appointments: [] } }));
    service.updateAppointmentStatus.and.returnValue(of({ isSuccess: true, message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [{ provide: AppointmentService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the selected status filter and reset pagination', () => {
    component.onFilterChange('Completed');

    expect(component.statusFilter()).toBe('Completed');
    expect(component.pageNumber()).toBe(1);
    expect(service.getAppointments).toHaveBeenCalled();
  });
});
