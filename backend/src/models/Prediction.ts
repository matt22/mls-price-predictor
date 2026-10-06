import { z } from './zod.js';

export const PredictionFactorsSchema = z
  .object({
    interestRate: z.number(),
    comps: z.array(
      z.object({
        id: z.string().uuid(),
        price: z.number(),
        distance: z.number().openapi({ description: 'Miles from the listing.' }),
        similarity: z.number(),
      }),
    ),
    marketTrend: z.number(),
    seasonalAdjustment: z.number(),
    pricePerSqft: z.number(),
  })
  .openapi('PredictionFactors');

export type PredictionFactors = z.infer<typeof PredictionFactorsSchema>;

// The JSON shape of a predictions row, after database.ts camelizes columns.
export const PredictionSchema = z
  .object({
    id: z.string().uuid(),
    listingId: z.string().uuid(),
    predictedPrice: z.number(),
    confidence: z.number().min(0).max(1),
    factors: PredictionFactorsSchema.nullable(),
    interestRate: z.number().nullable(),
    estimatedDelisting: z.boolean().nullable(),
    delistingReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Prediction');

export type Prediction = z.infer<typeof PredictionSchema>;

export const PredictionQuerySchema = z.object({
  interestRate: z.coerce.number().positive().default(6.8).openapi({ description: 'Mortgage rate, in percent.' }),
  marketTrend: z.coerce.number().default(0).openapi({ description: 'Fractional adjustment, e.g. 0.02 for +2%.' }),
});

export const BatchPredictionRequestSchema = z
  .object({
    listingIds: z.array(z.string().uuid()).min(1),
    interestRate: z.number().positive().default(6.8),
  })
  .openapi('BatchPredictionRequest');

export const BatchPredictionResponseSchema = z
  .object({
    predictions: z.array(PredictionSchema),
    count: z.number().int(),
  })
  .openapi('BatchPredictionResponse');
