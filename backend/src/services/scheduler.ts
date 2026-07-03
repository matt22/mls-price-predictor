import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { fetchListings } from './rentcastService.js';
import { db } from '../utils/database.js';

export function initializeScheduledJobs() {
  logger.info('Initializing scheduled jobs...');

  // Fetch listings from RentCast weekly
  // Runs every Monday at 2:00 AM
  cron.schedule('0 2 * * 1', async () => {
    logger.info('Running weekly RentCast listings sync...');
    try {
      await syncRentCastListings();
    } catch (error) {
      logger.error('Weekly sync failed:', error);
    }
  });

  // Calculate predictions for new listings daily
  // Runs every day at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running daily prediction calculations...');
    try {
      await calculatePredictionsForNewListings();
    } catch (error) {
      logger.error('Daily prediction calculation failed:', error);
    }
  });
}

async function syncRentCastListings() {
  try {
    const listings = await fetchListings({
      state: 'CA', // Start with California, expand as needed
      limit: 100,
    });

    for (const listing of listings) {
      const query = `
        INSERT INTO listings (
          rentcast_id, address, city, state, zip_code,
          latitude, longitude, list_price, beds, baths, sqft,
          property_type, year_built, listing_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        ON CONFLICT (rentcast_id) DO UPDATE SET updated_at = NOW()
      `;

      await db.none(query, [
        listing.id,
        listing.address,
        listing.city,
        listing.state,
        listing.zipCode,
        listing.latitude,
        listing.longitude,
        listing.listPrice,
        listing.beds,
        listing.baths,
        listing.sqft,
        listing.propertyType,
        listing.yearBuilt,
        listing.status,
      ]);
    }

    logger.info(`Synced ${listings.length} listings from RentCast`);
  } catch (error) {
    logger.error('RentCast sync error:', error);
    throw error;
  }
}

async function calculatePredictionsForNewListings() {
  try {
    const query = `
      SELECT id FROM listings 
      WHERE id NOT IN (SELECT listing_id FROM predictions)
      LIMIT 50
    `;

    const newListings = await db.query(query);
    logger.info(`Calculating predictions for ${newListings.length} new listings`);

    // Predictions will be calculated per listing via API endpoint
  } catch (error) {
    logger.error('Prediction calculation error:', error);
    throw error;
  }
}
