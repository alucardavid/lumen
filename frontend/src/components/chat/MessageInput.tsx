import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface MessageInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  activeSession: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSubmit,
  loading,
  activeSession
}) => {
  const isDisabled = loading || !activeSession || !input.trim();

  return (
    <div className="sticky bottom-0 bg-white border-t p-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading || !activeSession}
        />
        <Button type="submit" disabled={isDisabled}>
          Enviar
        </Button>
      </form>
    </div>
  );
};
