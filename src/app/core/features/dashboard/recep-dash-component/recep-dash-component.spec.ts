import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepDashComponent } from './recep-dash-component';

describe('RecepDashComponent', () => {
  let component: RecepDashComponent;
  let fixture: ComponentFixture<RecepDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepDashComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecepDashComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
