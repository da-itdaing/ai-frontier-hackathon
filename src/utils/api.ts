import type { CardData } from "data";

export type MatchResult = { id: string; score: number };
export type MatchResponse = {
  needMatches: Record<string, MatchResult[]>;
  giveMatches: Record<string, MatchResult[]>;
  categorySuggestions: Array<{
    id: string;
    originalCategory?: string;
    suggestedCategory?: string;
    confidence: number;
  }>;
};

// Resolve API base robustly for any dev port (e.g., 3000, 5173, etc.)
// Default to same-origin '/api' which works behind Nginx or an ALB path rule.
// Allow override via VITE_API_BASE for local dev or custom deployments.
const API_BASE = ((import.meta as any)?.env?.VITE_API_BASE as string) || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Avoid setting Content-Type for simple GETs to prevent unnecessary preflights.
  const hasBody = !!(init && 'body' in init && (init as any).body);
  const method = (init?.method || 'GET').toUpperCase();
  const headers = new Headers(init?.headers || {});
  if ((method !== 'GET' && method !== 'HEAD') || hasBody) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchCategories(): Promise<{ needsCategories: string[]; givesCategories: string[] }> {
  return request('/categories');
}

export async function computeMatches(payload: { needs: CardData[]; gives: CardData[]; top_k?: number; }): Promise<MatchResponse> {
  return request('/match', { method: 'POST', body: JSON.stringify({ top_k: 5, ...payload }) });
}

export async function fetchStoredMatches(): Promise<MatchResponse> {
  return request('/matches');
}

export async function saveMatches(data: MatchResponse): Promise<MatchResponse> {
  return request('/save', { method: 'POST', body: JSON.stringify(data) });
}

export async function enrichItem(input: { title: string; description: string; skills: string[]; tags: string[]; category?: string; }): Promise<{ suggestedCategory?: string; tags: string[]; skills?: string[]; matchingTags?: string[]; confidence: number; }> {
  return request('/enrich', { method: 'POST', body: JSON.stringify(input) });
}
