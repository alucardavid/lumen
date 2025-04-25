import React, { useState, useEffect } from 'react';
import { ChatSession } from '../../types/chat';

interface SessionTimerProps {
  startTime: string | undefined;
  onTimeWarning: () => void;
  onTimeEnd: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  startTime, 
  onTimeWarning,
  onTimeEnd 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    if (!startTime) {
      console.log('No start time available');
      return;
    }

    try {
      const sessionStart = new Date(startTime).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - sessionStart) / 1000);
        const remainingSeconds = Math.max(10 - elapsedSeconds, 0); // 30 minutos = 1800 segundos
        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 60 && !warningShown) {
          setWarningShown(true);
          onTimeWarning();
        }

        if (remainingSeconds === 0) {
          onTimeEnd();
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, [startTime, warningShown, onTimeWarning, onTimeEnd]);

  if (!startTime || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-sm text-gray-600">
      Tempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};