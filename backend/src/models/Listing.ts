import { z } from 'zod';

export const ListingSchema = z.object({
  id: z.string(),
  rentcastId: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  listPrice: z.number(),
  estimatedValue: z.number().optional(),
  beds: z.number(),
  baths: z.number(),
  sqft: z.number(),
  propertyType: z.string(),
  yearBuilt: z.number().optional(),
  daysOnMarket: z.number().optional(),
  listingStatus: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Listing = z.infer<typeof ListingSchema>;

export interface ListingFilters {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
}
