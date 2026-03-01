export interface TrainLogEntry {
  id?: number;
  timestamp: number;
  car: string;
  line: string;
  notes?: string;
}
