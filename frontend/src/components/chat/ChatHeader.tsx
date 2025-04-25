import React from 'react';
import { Button } from '../ui/button';
import { ChatSession } from '../../types/chat';
import { SessionTimer } from './SessionTimer';

interface ChatHeaderProps {
  error: string | null;
  activeSession: ChatSession | null;
  sessionEnding: boolean;
  onEndSession: () => void;
  onTimeWarning: () => void;
  onTimeEnd: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  error,
  activeSession,
  sessionEnding,
  onEndSession,
  onTimeWarning,
  onTimeEnd
}) => {
  return (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div className="flex items-center gap-4">
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          <Button
            variant="destructive"
            onClick={onEndSession}
            disabled={!activeSession || sessionEnding}
          >
            {sessionEnding ? 'Finalizando...' : 'Finalizar Sessão'}
          </Button>
        </div>
      </div>

      {activeSession && (
        <div className="flex justify-center items-center py-2">
          <SessionTimer 
            startTime={activeSession.started_at} 
            onTimeWarning={onTimeWarning}
            onTimeEnd={onTimeEnd}
          />
        </div>
      )}
    </>
  );
};
