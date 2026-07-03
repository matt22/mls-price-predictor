import { Listing } from '../models/Listing.js';
import { PredictionFactors } from '../models/Prediction.js';
import { logger } from '../utils/logger.js';
import { db } from '../utils/database.js';

interface PredictionInput {
  listing: Listing;
  interestRate: number;
  marketTrend?: number;
}

export async function calculatePricePrediction(input: PredictionInput): Promise<{
  predictedPrice: number;
  confidence: number;
  factors: PredictionFactors;
}> {
  try {
    const { listing, interestRate, marketTrend = 0 } = input;

    // Find comparable listings
    const comps = await findComparables(listing);

    // Calculate base metrics
    const pricePerSqft = listing.listPrice / (listing.sqft || 1);
    const avgCompPrice = comps.length > 0
      ? comps.reduce((sum, c) => sum + c.price, 0) / comps.length
      : listing.listPrice;

    // Rule-based prediction logic
    let adjustedPrice = avgCompPrice;
    const adjustments: Record<string, number> = {};

    // Interest rate adjustment (higher rates = lower prices)
    const rateAdjustment = 1 - (interestRate - 6.5) * 0.02; // Base rate 6.5%
    adjustments.interestRate = rateAdjustment;
    adjustedPrice *= rateAdjustment;

    // Market trend adjustment
    if (marketTrend) {
      adjustments.marketTrend = 1 + marketTrend;
      adjustedPrice *= (1 + marketTrend);
    }

    // Condition-based adjustments
    const daysOnMarket = listing.daysOnMarket || 0;
    if (daysOnMarket > 60) {
      const daysAdjustment = 1 - (daysOnMarket - 60) * 0.003;
      adjustments.daysOnMarket = daysAdjustment;
      adjustedPrice *= daysAdjustment;
    }

    // Calculate confidence based on data quality
    const confidence = calculateConfidence(comps, listing);

    return {
      predictedPrice: Math.round(adjustedPrice),
      confidence,
      factors: {
        interestRate,
        comps,
        marketTrend,
        seasonalAdjustment: 1.0,
        pricePerSqft,
      },
    };
  } catch (error) {
    logger.error('Prediction calculation error:', error);
    throw new Error('Failed to calculate price prediction');
  }
}

async function findComparables(listing: Listing): Promise<Array<{
  id: string;
  price: number;
  distance: number;
  similarity: number;
}>> {
  try {
    const query = `
      SELECT 
        id,
        list_price as price,
        ST_Distance(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint($1, $2)::geography
        ) / 1609.34 as distance
      FROM listings
      WHERE 
        beds = $3 AND
        baths = $4 AND
        property_type = $5 AND
        ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint($1, $2)::geography,
          16093.4
        )
      ORDER BY distance
      LIMIT 5
    `;

    const comps = await db.query(query, [
      listing.longitude,
      listing.latitude,
      listing.beds,
      listing.baths,
      listing.propertyType,
    ]);

    return comps.map((comp: any) => ({
      id: comp.id,
      price: comp.price,
      distance: comp.distance,
      similarity: 0.95 - (comp.distance / 10) * 0.1,
    }));
  } catch (error) {
    logger.error('Error finding comparables:', error);
    return [];
  }
}

function calculateConfidence(comps: any[], listing: Listing): number {
  let confidence = 0.5; // Base confidence

  // More comparables = higher confidence
  confidence += Math.min(comps.length * 0.1, 0.25);

  // Better data quality = higher confidence
  if (listing.sqft && listing.yearBuilt) {
    confidence += 0.15;
  }

  return Math.min(confidence, 0.95);
}
