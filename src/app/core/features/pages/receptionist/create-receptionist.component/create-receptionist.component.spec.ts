import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReceptionistComponent } from './create-receptionist.component';

describe('CreateReceptionistComponent', () => {
  let component: CreateReceptionistComponent;
  let fixture: ComponentFixture<CreateReceptionistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReceptionistComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReceptionistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
