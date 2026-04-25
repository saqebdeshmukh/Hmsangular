import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashComponent } from './admin-dash-component';

describe('AdminDashComponent', () => {
  let component: AdminDashComponent;
  let fixture: ComponentFixture<AdminDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
