export interface ScoreData {
  baseScore: number;
  typeIds: number[];
  userId: number;
  userIds: number[] | null;
  totalCount: number;
  correctCount: number;
  accuracyRate: number;
}

export interface ApiResponse {
  code: number;
  message: string;
  data: ScoreData;
}
