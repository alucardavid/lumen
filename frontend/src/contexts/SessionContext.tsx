import React, { createContext, useContext, useState } from 'react';
import { UserSessions } from '../types/session';

interface SessionContextType {
    sessions: UserSessions;
    updateSessions: (sessions: UserSessions) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useState<UserSessions>({
        available_sessions: 0,
        used_sessions: 0
    });

    const updateSessions = (newSessions: UserSessions) => {
        setSessions(newSessions);
    };

    return (
        <SessionContext.Provider value={{ sessions, updateSessions }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessions = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSessions must be used within a SessionProvider');
    }
    return context;
};