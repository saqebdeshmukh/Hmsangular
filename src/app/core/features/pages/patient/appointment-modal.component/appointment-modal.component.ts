import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-modal.component.html',
  styleUrl: './appointment-modal.component.css',
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalZoom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in',
          style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class AppointmentModalComponent implements OnChanges {

  @Input() show = false;
  @Input() doctors: any[] = [];
  @Input() patientDetails: any;

  @Output() close = new EventEmitter<void>();
  @Output() book = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      doctorId: [''],
      reason: [''],
      weight: [''],
      height: [''],
      bloodPressure: [''],
      sugarBeforeMeal: [''],
      sugarAfterMeal: [''],
      appointmentDate: [this.minDate] // Set default to today's date
    });
    // default the appointment date to today
    this.form.patchValue({ appointmentDate: this.minDate });
  }
private formatToInputDate(value: any) {
    if (!value) return this.minDate;
    const d = new Date(value);
    if (isNaN(d.getTime())) return this.minDate;
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  ngOnChanges(changes: SimpleChanges) {

  // ✅ Auto select doctor if only one and disable the control so user can't change it
  if (changes['doctors']) {
    if (this.doctors?.length === 1) {
      this.form.get('doctorId')?.setValue(this.doctors[0].id);
      this.form.get('doctorId')?.disable({ emitEvent: false });
    } else {
      this.form.get('doctorId')?.enable({ emitEvent: false });
    }
  }

  // ✅ Guard against null
  if (changes['patientDetails'] && this.patientDetails) {

    const health = this.patientDetails // <-- match API name

    if (health) {
      this.form.patchValue({
        bloodPressure: health.bloodPressure ?? '',
        sugarBeforeMeal: health.sugarBeforeMeal ?? '',
        sugarAfterMeal: health.sugarAfterMeal ?? '',
        weight: health.weight ?? '',
        height: health.height ?? ''
      });
    }
  }
}
minDate: string = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  })();


  
  @HostListener('document:keydown.escape')
  handleEsc() {
    if (this.show) {
      this.onClose();
    }
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick() {
    this.onClose();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onBook() {
    const values = this.form.getRawValue();
    this.book.emit({
      patientId: this.patientDetails.id,
      doctorId: values.doctorId,
      reason: values.reason,
      weight: values.weight,
      height: values.height,
      bloodPressure: values.bloodPressure,
      sugarBeforeMeal: values.sugarBeforeMeal,
      sugarAfterMeal: values.sugarAfterMeal,
      appointmentDate: values.appointmentDate
    });
  }
}