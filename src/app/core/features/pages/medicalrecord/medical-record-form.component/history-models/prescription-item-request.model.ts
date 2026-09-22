export interface PrescriptionItemRequest {
  id?: string | null;
  medicineName: string;
  dosage: string;
  frequency: number;
  mealTiming: string;
  duration: string;
}