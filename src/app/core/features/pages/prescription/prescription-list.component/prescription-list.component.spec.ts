import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthService } from '../../../../services/auth.services';
import { PrescriptionService } from '../../../../services/prescription.service';
import { PrescriptionListComponent } from './prescription-list.component';

describe('PrescriptionListComponent', () => {
  let component: PrescriptionListComponent;
  let fixture: ComponentFixture<PrescriptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionListComponent, RouterTestingModule],
      providers: [
        {
          provide: PrescriptionService,
          useValue: {
            getInternalPrescriptions: () => of({ data: { internalAppointments: [] } }),
            getExternalPrescriptions: () => of({ data: { externalAppointments: [] } }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            user: signal({ role: 'Doctor' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep filters scoped to the active tab', () => {
    component.internalPrescriptions.set([
      { id: 1, patientName: 'Alice', type: 'Internal' },
    ]);
    component.externalPrescriptions.set([
      { id: 2, patientName: 'Bob', type: 'External' },
    ]);

    component.activeTab.set('internal');
    component.updateSearchFilter('Alice');

    expect(component.filteredData()).toEqual([
      { id: 1, patientName: 'Alice', type: 'Internal' },
    ]);

    component.activeTab.set('external');
    component.updateSearchFilter('Bob');

    expect(component.filteredData()).toEqual([
      { id: 2, patientName: 'Bob', type: 'External' },
    ]);
  });

  it('should hide the print action for internal prescriptions', () => {
    component.activeTab.set('internal');

    const actions = component.columnDefs[component.columnDefs.length - 1] as any;
    const rendered = actions.cellRenderer({ data: { id: 99 } });

    expect(rendered).not.toContain('print-btn');
  });
});
