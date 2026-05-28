export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }
  const prefix = apiKey.slice(0, 5);
  const suffix = apiKey.slice(-3);
  const middleLength = apiKey.length - 8;
  const middle = '*'.repeat(Math.min(middleLength, 12));
  return `${prefix}${middle}${suffix}`;
}

const SENSITIVE_KEY_PATTERNS = [
  /^"?apiKey"?$/i,
  /^"?api_key"?$/i,
  /^"?API_KEY"?$/,
  /^"?OPENAI_API_KEY"?$/,
  /^"?ANTHROPIC_API_KEY"?$/,
  /^"?ANTHROPIC_AUTH_TOKEN"?$/,
  /^"?Authorization"?$/i,
];

function redactValue(value: string): string {
  if (value.length <= 8) return '****';
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function redactBearerToken(value: string): string {
  const match = value.match(/^(Bearer\s+)(.+)$/i);
  if (match) {
    return `${match[1]}${redactValue(match[2])}`;
  }
  return redactValue(value);
}

export function redactSensitive(content: string): string {
  try {
    const obj = JSON.parse(content);
    const redacted = redactObject(obj);
    return JSON.stringify(redacted, null, 2);
  } catch {
    return redactJsonLines(content);
  }
}

function redactObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(redactObject);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === 'string' && isSensitiveKey(key)) {
      if (key.toLowerCase() === 'authorization') {
        result[key] = redactBearerToken(value);
      } else {
        result[key] = redactValue(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));
}

function redactJsonLines(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      const kvMatch = line.match(
        /^(\s*"(?:apiKey|api_key|API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|Authorization)"\s*:\s*")(.+)"(,?\s*)$/i
      );
      if (kvMatch) {
        const val = kvMatch[2];
        if (kvMatch[1].toLowerCase().includes('authorization')) {
          return `${kvMatch[1]}${redactBearerToken(val)}"${kvMatch[3]}`;
        }
        return `${kvMatch[1]}${redactValue(val)}"${kvMatch[3]}`;
      }
      const bearerMatch = line.match(
        /^(\s*"(?:Authorization)"\s*:\s*"Bearer\s+)(.+)"(,?\s*)$/i
      );
      if (bearerMatch) {
        return `${bearerMatch[1]}${redactValue(bearerMatch[2])}"${bearerMatch[3]}`;
      }
      return line;
    })
    .join('\n');
}
