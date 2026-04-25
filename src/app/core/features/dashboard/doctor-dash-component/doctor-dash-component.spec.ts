import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDashComponent } from './doctor-dash-component';

describe('DoctorDashComponent', () => {
  let component: DoctorDashComponent;
  let fixture: ComponentFixture<DoctorDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDashComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorDashComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
