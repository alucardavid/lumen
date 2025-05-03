import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
  startTime: string | undefined;
  isActive: boolean;
  sessionEnding: boolean;
  onTimeWarning: () => void;
  onTimeEnd: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  startTime, 
  isActive,
  sessionEnding,
  onTimeWarning,
  onTimeEnd 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [warningShown, setWarningShown] = useState(false);
  const [timeEndCalled, setTimeEndCalled] = useState(false);

  // Reset warning state when session becomes inactive or startTime changes
  useEffect(() => {
    setWarningShown(false);
    setTimeEndCalled(false);
  }, [startTime, isActive]);

  useEffect(() => {
    if (!startTime || !isActive || sessionEnding) {
      console.log('No start time available or session is not active or is ending');
      return;
    }

    try {
      const sessionStart = new Date(startTime).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - sessionStart) / 1000);
        const remainingSeconds = Math.max(60 - elapsedSeconds, 0); // 30 minutos = 1800 segundos
        setTimeLeft(remainingSeconds);

        if (!isActive || sessionEnding) return;

        if (remainingSeconds <= 300 && !warningShown) {
          setWarningShown(true);
          onTimeWarning();
        }

        if (remainingSeconds === 0 && !timeEndCalled) {
          setTimeEndCalled(true);
          onTimeEnd();
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, [startTime, isActive, sessionEnding, timeEndCalled, onTimeWarning, onTimeEnd]);

  if (!startTime || timeLeft <= 0 || !isActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-sm text-gray-600">
      Tempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};