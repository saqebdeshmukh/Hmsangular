import { HealthReportHistory } from './health-report-history.model';
import { PrescriptionViewModel } from './prescription-view-model';

export interface HistoryModel {
  medicalRecordId: string;
  visitDate: string;

  diagnosis: string;
  symptoms: string;
  treatment: string;

  healthReport?: HealthReportHistory | null;

  prescriptions: PrescriptionViewModel[];
}