import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { openApiDocument } from '../src/openapi/document.js';
import { ListingSchema } from '../src/models/Listing.js';
import { PredictionSchema } from '../src/models/Prediction.js';

const camelize = (column: string) => column.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function tableColumns(table: string): string[] {
  const sql = readFileSync(new URL('../migrations/001_init.sql', import.meta.url), 'utf8');
  const body = sql.match(new RegExp(`CREATE TABLE ${table} \\(([\\s\\S]*?)\\n\\);`))?.[1];
  if (!body) throw new Error(`No CREATE TABLE ${table} in migration`);
  return body
    .split('\n')
    .map((line) => line.trim().split(/\s+/)[0])
    .filter((name) => /^[a-z_]+$/.test(name) && name !== 'UNIQUE')
    .map(camelize);
}

describe('OpenAPI spec', () => {
  it('matches the committed backend/openapi.json (run `npm run openapi` after changing schemas)', () => {
    const committed = JSON.parse(readFileSync(new URL('../openapi.json', import.meta.url), 'utf8'));
    expect(committed).toEqual(JSON.parse(JSON.stringify(openApiDocument)));
  });

  it('documents every column the API returns for listings and predictions', () => {
    expect(Object.keys(ListingSchema.shape).sort()).toEqual(tableColumns('listings').sort());
    expect(Object.keys(PredictionSchema.shape).sort()).toEqual(tableColumns('predictions').sort());
  });
});
