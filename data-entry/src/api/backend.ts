/**
 * Backend API Client
 *
 * Replaces the Google Apps Script API with calls to EV-Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.empowered.vote';

interface FetchOptions extends RequestInit {
  body?: string;
}

/**
 * Helper function for API requests with session authentication
 */
async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Types matching the backend models
export interface StagingStance {
  id: string;
  context_key: string;
  politician_external_id?: string;
  politician_name: string;
  topic_key: string;
  value: number;
  reasoning: string;
  sources: string[];
  status: 'draft' | 'needs_review' | 'approved' | 'rejected';
  added_by: string;
  review_count: number;
  reviewed_by: string[];
  locked_by?: string;
  locked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StagingPolitician {
  id: string;
  external_id?: string;
  full_name: string;
  party: string;
  office: string;
  office_level: string;
  state: string;
  district: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  added_by: string;
  created_at: string;
}

export interface Topic {
  id: string;
  topic_key: string;
  title: string;
  short_title: string;
  start_phrase: string;
  stances: Array<{ id: string; value: number; text: string }>;
}

export interface AllData {
  stances: StagingStance[];
  politicians: StagingPolitician[];
  topics: Topic[];
}

/**
 * Fetch all data (politicians, stances, topics)
 */
export async function getData(): Promise<AllData> {
  return fetchAPI<AllData>('/staging/data');
}

/**
 * Add a new politician
 */
export async function addPolitician(data: {
  external_id?: string;
  full_name: string;
  party: string;
  office: string;
  office_level: string;
  state: string;
  district: string;
}): Promise<StagingPolitician> {
  return fetchAPI<StagingPolitician>('/staging/politicians', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Add a new stance
 */
export async function addStance(data: {
  politician_external_id?: string;
  politician_name: string;
  topic_key: string;
  value: number;
  reasoning: string;
  sources: string[];
}): Promise<StagingStance> {
  return fetchAPI<StagingStance>('/staging/stances', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing stance
 */
export async function updateStance(
  id: string,
  data: {
    value?: number;
    reasoning?: string;
    sources?: string[];
  }
): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/staging/stances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Submit a stance for review
 */
export async function submitForReview(id: string): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/staging/stances/${id}/submit`, {
    method: 'POST',
  });
}

/**
 * Acquire a lock on a stance
 */
export async function acquireLock(id: string): Promise<{
  locked: boolean;
  locked_by: string;
  expires_at: string;
}> {
  return fetchAPI(`/staging/stances/${id}/lock`, {
    method: 'POST',
  });
}

/**
 * Release a lock on a stance
 */
export async function releaseLock(id: string): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/staging/stances/${id}/lock`, {
    method: 'DELETE',
  });
}

/**
 * Approve a review
 */
export async function approveReview(id: string): Promise<{
  status: string;
  review_count: number;
  approved: boolean;
}> {
  return fetchAPI(`/staging/stances/${id}/approve`, {
    method: 'POST',
  });
}

/**
 * Reject a stance
 */
export async function rejectStance(
  id: string,
  comment?: string
): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/staging/stances/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

/**
 * Edit and resubmit a stance
 */
export async function editAndResubmit(
  id: string,
  data: {
    value: number;
    reasoning: string;
    sources: string[];
  }
): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(`/staging/stances/${id}/edit-resubmit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get the review queue (stances needing review)
 */
export async function getReviewQueue(): Promise<StagingStance[]> {
  return fetchAPI<StagingStance[]>('/staging/stances/review-queue');
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<{ user_id: string; username: string; completed_onboarding: boolean } | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    if (response.ok) {
      return response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Register a new account
 */
export async function register(
  username: string,
  password: string
): Promise<{ user_id: string }> {
  return fetchAPI<{ user_id: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Login
 */
export async function login(
  username: string,
  password: string
): Promise<{ user_id: string }> {
  return fetchAPI<{ user_id: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
