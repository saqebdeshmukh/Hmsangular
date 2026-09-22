import { PrescriptionItemRequest } from './prescription-item-request.model';

export interface PrescriptionViewModel {
  id: string;
  medicalRecordId?: string | null;
  patientId: string;
  patientName?: string;
  prescriptionDate: string;
  doctorId: string;
  doctorName?: string;
  instructions: string;
  type?: string | null;
  prescriptionItemRequests: PrescriptionItemRequest[];
}