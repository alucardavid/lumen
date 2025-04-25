export interface Message {
    id: number;
    content: string;
    is_user: boolean;
    created_at: string;
    sentiment?: string;
  }
  
  export interface ChatSession {
    id: number;
    started_at: string;
    created_at: string;
    is_active: boolean;
  }
  
  export interface ApiError {
    detail: string;
  }