import { z } from './zod.js';

// The JSON shape of a listings row, after database.ts camelizes columns.
export const ListingSchema = z
  .object({
    id: z.string().uuid(),
    rentcastId: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    listPrice: z.number(),
    beds: z.number().int().nullable(),
    baths: z.number().nullable(),
    sqft: z.number().int().nullable(),
    propertyType: z.string().nullable(),
    yearBuilt: z.number().int().nullable(),
    listingStatus: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Listing');

export type Listing = z.infer<typeof ListingSchema>;

export const IdParamsSchema = z.object({ id: z.string().uuid() });

export const ListingFiltersSchema = z.object({
  city: z.string().optional().openapi({ description: 'Case-insensitive substring match.' }),
  state: z.string().length(2).optional(),
  zipCode: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  beds: z.coerce.number().int().nonnegative().optional(),
  baths: z.coerce.number().nonnegative().optional(),
  propertyType: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusMiles: z.coerce
    .number()
    .positive()
    .optional()
    .openapi({ description: 'Applied only when lat and lng are also set.' }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListingFilters = z.infer<typeof ListingFiltersSchema>;

export const ListingsPageSchema = z
  .object({
    data: z.array(ListingSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int().openapi({ description: 'Listings matching the filters across all pages.' }),
    }),
  })
  .openapi('ListingsPage');
