import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMedicalRecordComponent } from './select-medical-record.component';

describe('SelectMedicalRecordComponent', () => {
  let component: SelectMedicalRecordComponent;
  let fixture: ComponentFixture<SelectMedicalRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMedicalRecordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMedicalRecordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
