import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordDetailsComponent } from './medical-record-details.component';

describe('MedicalRecordDetailsComponent', () => {
  let component: MedicalRecordDetailsComponent;
  let fixture: ComponentFixture<MedicalRecordDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecordDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalRecordDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
