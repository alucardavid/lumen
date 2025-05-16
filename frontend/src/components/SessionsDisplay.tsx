import React from 'react';
import { useSessions } from '../contexts/SessionContext';
import { Link } from 'react-router-dom';

export const SessionsDisplay: React.FC = () => {
    const { sessions } = useSessions();

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium">Suas Sessões</h3>
            <p className="mt-2">Disponíveis: {sessions.available_sessions}</p>
            <p>Utilizadas: {sessions.used_sessions}</p>
            {sessions.available_sessions === 0 && (
                <Link
                    to="/buy-sessions"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-500"
                >
                    Comprar mais sessões
                </Link>
            )}
        </div>
    );
};