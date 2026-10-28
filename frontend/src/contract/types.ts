export interface Test {
  id: string;
  code: string;
  name: string;
  price: number | null;
  status: boolean;
}

export interface PlanItem {
  type: 'package' | 'test';
  id: string;
  name: string;
  price: number;
  covers: string[];
}

export interface Plan {
  items: PlanItem[];
  total: number;
  extraTests: string[];
  individualTotal: number | null;
  savings: number | null;
}

export type ApiErrorCode = 'EMPTY_SELECTION' | 'INVALID_TESTS' | 'NOT_AVAILABLE';

export interface ApiErrorBody {
  error: ApiErrorCode;
  testIds: string[];
}