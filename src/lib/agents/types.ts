export type AgentName =
  | 'orchestrator' | 'keyword-researcher' | 'serp-analyst' | 'content-writer' | 'compliance-checker'
  | 'technical-auditor' | 'schema-feed' | 'image-checker' | 'internal-linking' | 'geo-visibility' | 'offsite-pr' | 'reporter';

export type TaskStatus = 'queued' | 'running' | 'needs_review' | 'needs_approval' | 'done' | 'failed' | 'cancelled';

export interface Task {
  id: string; agent: AgentName; type: string; payload: Record<string, unknown>;
  status: TaskStatus; priority: number; attempts: number; max_attempts: number;
  parent_task_id: string | null; requires_approval: boolean;
}

export interface NewTask { agent: AgentName; type: string; payload: Record<string, unknown>; priority?: number; requires_approval?: boolean; parent_task_id?: string; created_by?: string }

export interface UrlMetrics {
  url: string; keyword?: string; indexed: boolean; daysSincePublished: number;
  impressions28: number; clicks28: number; ctr28: number; position28: number | null; positionPrev28: number | null;
  expectedCtr?: number; competingUrls?: string[]; merchantDisapproved?: boolean; aiCitationGap?: boolean;
}

export interface Decision { url: string; diagnosis: string; actions: NewTask[]; score: number }
