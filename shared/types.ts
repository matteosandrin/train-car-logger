export interface TrainLogEntry {
  id?: number;
  timestamp: number;
  car: string;
  line: string;
  notes?: string;
  origin?: string;
  destination?: string;
}

export interface StationPair {
  origin: string;
  destination: string;
  count: number;
}
