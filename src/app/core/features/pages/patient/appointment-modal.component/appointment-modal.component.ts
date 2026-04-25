import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-appointment-modal',
  imports: [],
  templateUrl: './appointment-modal.component.html',
  styleUrl: './appointment-modal.component.css',
})
export class AppointmentModalComponent {
   @Input() show = false;
  @Input() doctors: any[] = [];
  @Input() patientId!: string;

  @Output() close = new EventEmitter<void>();
  @Output() book = new EventEmitter<any>();

  selectedDoctor = signal('');
  reason = signal('');

  onClose() {
    this.close.emit();
  }
 
  onBook() {
    if (!this.selectedDoctor()) return;

    this.book.emit({
      patientId: this.patientId,
      doctorId: this.selectedDoctor(),
      reason: this.reason()
    });
  }
}
