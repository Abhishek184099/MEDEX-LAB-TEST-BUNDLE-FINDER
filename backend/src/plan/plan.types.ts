export interface PlanItem {
  type: 'package' | 'test';
  id: string;
  name: string;
  price: number;
  covers: string[];
}

export interface SolvedPlan {
  items: PlanItem[];
  total: number;
  extraTests: string[] | [];
}

export interface PlanResponse extends SolvedPlan {
  individualTotal: number | null;
  savings: number | null;
}

export interface PlanRequest {
  testIds?: string[];
}


