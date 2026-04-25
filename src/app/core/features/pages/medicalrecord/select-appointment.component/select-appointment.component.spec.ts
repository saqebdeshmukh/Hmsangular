import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAppointmentComponent } from './select-appointment.component';

describe('SelectAppointmentComponent', () => {
  let component: SelectAppointmentComponent;
  let fixture: ComponentFixture<SelectAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAppointmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectAppointmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
