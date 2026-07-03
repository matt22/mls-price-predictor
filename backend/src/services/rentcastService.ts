import axios from 'axios';
import { logger } from '../utils/logger.js';

const RENTCAST_API_URL = 'https://api.rentcast.io/v1';
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;

interface RentCastListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  listPrice: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  yearBuilt?: number;
  status: string;
}

export async function fetchListings(filters: {
  state: string;
  city?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<RentCastListing[]> {
  try {
    const params = new URLSearchParams({
      state: filters.state,
      status: filters.status || 'Active',
      limit: String(filters.limit || 100),
      offset: String(filters.offset || 0),
      ...(filters.city && { city: filters.city }),
    });

    const response = await axios.get(
      `${RENTCAST_API_URL}/listings/sale/search?${params}`,
      {
        headers: {
          'X-API-Key': RENTCAST_API_KEY,
        },
      },
    );

    logger.info(`Fetched ${response.data.length} listings from RentCast`);
    return response.data;
  } catch (error) {
    logger.error('RentCast API error:', error);
    throw new Error('Failed to fetch listings from RentCast');
  }
}

export async function getListingDetails(propertyId: string): Promise<RentCastListing | null> {
  try {
    const response = await axios.get(
      `${RENTCAST_API_URL}/listings/${propertyId}`,
      {
        headers: {
          'X-API-Key': RENTCAST_API_KEY,
        },
      },
    );

    return response.data;
  } catch (error) {
    logger.error('Error fetching listing details:', error);
    return null;
  }
}
