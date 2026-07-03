import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../utils/database.js';
import { calculatePricePrediction } from '../services/predictionEngine.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get prediction for a listing
router.get('/listing/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { interestRate = 6.8, marketTrend = 0 } = req.query;

    // Check if prediction already exists
    const existingPrediction = await db.oneOrNone(
      'SELECT * FROM predictions WHERE listing_id = $1',
      [id],
    );

    if (existingPrediction) {
      return res.json(existingPrediction);
    }

    // Get listing details
    const listing = await db.oneOrNone('SELECT * FROM listings WHERE id = $1', [id]);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Calculate prediction
    const prediction = await calculatePricePrediction({
      listing,
      interestRate: Number(interestRate),
      marketTrend: Number(marketTrend),
    });

    // Store prediction
    const query = `
      INSERT INTO predictions (
        listing_id, predicted_price, confidence, factors,
        interest_rate, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.one(query, [
      id,
      prediction.predictedPrice,
      prediction.confidence,
      JSON.stringify(prediction.factors),
      Number(interestRate),
    ]);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Batch predictions
router.post('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listingIds, interestRate = 6.8 } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ error: 'Invalid listingIds' });
    }

    const predictions = [];

    for (const listingId of listingIds) {
      try {
        const listing = await db.oneOrNone('SELECT * FROM listings WHERE id = $1', [listingId]);
        if (!listing) continue;

        const prediction = await calculatePricePrediction({
          listing,
          interestRate: Number(interestRate),
        });

        const result = await db.one(
          `INSERT INTO predictions (
            listing_id, predicted_price, confidence, factors,
            interest_rate, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (listing_id) DO UPDATE SET updated_at = NOW()
          RETURNING *`,
          [
            listingId,
            prediction.predictedPrice,
            prediction.confidence,
            JSON.stringify(prediction.factors),
            Number(interestRate),
          ],
        );

        predictions.push(result);
      } catch (error) {
        logger.error(`Error calculating prediction for listing ${listingId}:`, error);
      }
    }

    res.json({ predictions, count: predictions.length });
  } catch (error) {
    next(error);
  }
});

export default router;
