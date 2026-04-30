import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  HostListener,
  OnChanges,
  SimpleChanges,
  input
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-appointment-modal',
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

  selectedDoctor = signal('');
  reason = signal('');
  systolicBp = signal('');
  diastolicBp = signal('');
  sugarBeforeMeal = signal('');
  sugarAfterMeal = signal('');
  weight = signal('');
  height = signal('');

  ngOnChanges(changes: SimpleChanges) {

  // ✅ Auto select doctor if only one
  if (changes['doctors'] && this.doctors?.length === 1) {
    this.selectedDoctor.set(this.doctors[0].id);
  }

  // ✅ Guard against null
  if (changes['patientDetails'] && this.patientDetails) {

    const health = this.patientDetails // <-- match API name

    if (health) {
      this.systolicBp.set(health.systolicBp ?? '');
      this.diastolicBp.set(health.diastolicBp ?? '');
      this.sugarBeforeMeal.set(health.sugarBeforeMeal ?? '');
      this.sugarAfterMeal.set(health.sugarAfterMeal ?? '');
      this.weight.set(health.weight ?? '');
      this.height.set(health.height ?? '');
    }
  }
}

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
    this.book.emit({
      patientId: this.patientDetails.id,
      doctorId: this.selectedDoctor(),
      reason: this.reason(),
      systolicBp: this.systolicBp(),
      diastolicBp: this.diastolicBp(),
      sugarBeforeMeal: this.sugarBeforeMeal(),
      sugarAfterMeal: this.sugarAfterMeal()
    });
  }
}