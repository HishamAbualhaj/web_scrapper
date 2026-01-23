export type SSEEventType = "progress" | "error" | "complete";

export interface SSEEvent {
  type: SSEEventType;
  message: string;
  msgT: string;
  current?: number;
  total?: number;
  percentage?: number;
  data?: any;
}
