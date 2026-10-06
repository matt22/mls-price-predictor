// Writes the generated spec to backend/openapi.json so the frontend can build
// types from it without a running server. Run: npm run openapi
import { writeFileSync } from 'node:fs';
import { openApiDocument } from '../src/openapi/document.js';

writeFileSync(new URL('../openapi.json', import.meta.url), JSON.stringify(openApiDocument, null, 2) + '\n');
console.log('Wrote backend/openapi.json');
