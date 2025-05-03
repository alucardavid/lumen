export interface ActiveSession {
    id: number;
    started_at: string;
    is_active: boolean;
    created_at: string;
}

export interface SessionSummary {
    suggestions: string[];
    progress_observations: string[];
    summary_text: string,
    key_topics: string[],
    overall_sentiment: string,
    risk_level: string,
    message_count: number,
    duration_minutes: number
}

export interface AvailableSessions {
    available_sessions: number;
    used_sessions: number;
}