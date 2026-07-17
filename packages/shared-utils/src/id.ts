import { randomUUID } from 'crypto';

export const generateId = (): string => randomUUID();
export const generateTraceId = (): string => randomUUID();