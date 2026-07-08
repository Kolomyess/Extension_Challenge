export type InsightType = "opportunity" | "alert" | "question";

export interface InsightMessage {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence?: number;
  createdAt: string;
}