import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordFormComponent } from './medical-record-form.component';

describe('MedicalRecordFormComponent', () => {
  let component: MedicalRecordFormComponent;
  let fixture: ComponentFixture<MedicalRecordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
