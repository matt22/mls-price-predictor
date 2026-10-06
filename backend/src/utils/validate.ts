import { z, ZodTypeAny } from 'zod';
import { httpError } from './errorHandler.js';

// Parse request input with a zod schema, turning the first issue into a 400.
export function parseInput<T extends ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw httpError(400, `${issue.path.join('.') || 'body'}: ${issue.message}`);
  }
  return result.data;
}
