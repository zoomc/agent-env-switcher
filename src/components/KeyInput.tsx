import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function KeyInput({
  value,
  onChange,
  label = 'API Key',
  placeholder = 'Enter API key',
  disabled = false,
}: KeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setShowKey(!showKey)}
          disabled={disabled}
          type="button"
        >
          {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
      <input
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono"
        type={showKey ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
