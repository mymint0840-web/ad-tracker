/**
 * Structured JSON logger with request context.
 *
 * Fields: timestamp, requestId, level, method, path, status, durationMs, userId, message, error
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  requestId: string;
  level: LogLevel;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  userId?: string;
  message: string;
  error?: string | Record<string, unknown>;
}

function log(level: LogLevel, data: Omit<LogEntry, 'timestamp' | 'level'>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    ...data,
  };
  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (data: Omit<LogEntry, 'timestamp' | 'level'>) => log('info', data),
  warn: (data: Omit<LogEntry, 'timestamp' | 'level'>) => log('warn', data),
  error: (data: Omit<LogEntry, 'timestamp' | 'level'>) => log('error', data),
};
