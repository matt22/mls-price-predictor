import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../utils/database.js';
import { ListingFilters } from '../models/Listing.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get all listings with filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      city,
      state,
      zipCode,
      minPrice,
      maxPrice,
      beds,
      baths,
      propertyType,
      lat,
      lng,
      radiusMiles,
      page = 1,
      limit = 20,
    } = req.query;

    let query = 'SELECT * FROM listings WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (city) {
      query += ` AND city ILIKE $${paramIndex++}`;
      params.push(`%${city}%`);
    }
    if (state) {
      query += ` AND state = $${paramIndex++}`;
      params.push(state);
    }
    if (zipCode) {
      query += ` AND zip_code = $${paramIndex++}`;
      params.push(zipCode);
    }
    if (minPrice) {
      query += ` AND list_price >= $${paramIndex++}`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND list_price <= $${paramIndex++}`;
      params.push(Number(maxPrice));
    }
    if (beds) {
      query += ` AND beds = $${paramIndex++}`;
      params.push(Number(beds));
    }
    if (baths) {
      query += ` AND baths = $${paramIndex++}`;
      params.push(Number(baths));
    }
    if (propertyType) {
      query += ` AND property_type = $${paramIndex++}`;
      params.push(propertyType);
    }
    if (lat && lng && radiusMiles) {
      query += `
        AND ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint($${paramIndex}, $${paramIndex + 1})::geography,
          $${paramIndex + 2}
        )
      `;
      params.push(Number(lng), Number(lat), Number(radiusMiles) * 1609.34);
      paramIndex += 3;
    }

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Number(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const listings = await db.query(query, params);

    res.json({
      data: listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: listings.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single listing
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const listing = await db.oneOrNone('SELECT * FROM listings WHERE id = $1', [id]);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
});

export default router;
