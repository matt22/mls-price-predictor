import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rentcastQueries, DEFAULT_QUERY } from '../config/rentcastQueries.js';

dotenv.config();

const RENTCAST_API_URL = 'https://api.rentcast.io/v1';
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;

async function main() {
  const queryName = process.argv[2] || DEFAULT_QUERY;
  const query = rentcastQueries[queryName];

  if (!query) {
    console.error(
      `Unknown query "${queryName}". Available: ${Object.keys(rentcastQueries).join(', ')}`,
    );
    process.exit(1);
  }

  if (!RENTCAST_API_KEY || RENTCAST_API_KEY === 'your_rentcast_api_key_here') {
    console.error('Missing RENTCAST_API_KEY - add your key to backend/.env before running this script.');
    process.exit(1);
  }

  console.log(`Running RentCast query "${queryName}" (1 API call): ${JSON.stringify(query)}`);

  const response = await axios.get(`${RENTCAST_API_URL}/listings/sale`, {
    headers: {
      'X-API-Key': RENTCAST_API_KEY,
    },
    params: query,
  });

  const listings = response.data;
  const count = Array.isArray(listings) ? listings.length : 'unknown';
  console.log(`Received ${count} listing(s).`);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outDir = path.join(__dirname, '..', 'data', 'rentcast');
  fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(outDir, `${queryName}_${timestamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify(response.data, null, 2));

  console.log(`Saved raw response to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((error) => {
  if (axios.isAxiosError(error)) {
    console.error('RentCast API error:', error.response?.status, error.response?.data ?? error.message);
  } else {
    console.error('Unexpected error:', error);
  }
  process.exit(1);
});
