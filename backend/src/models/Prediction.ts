import { z } from 'zod';

export const PredictionSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  predictedPrice: z.number(),
  confidence: z.number().min(0).max(1),
  factors: z.record(z.any()),
  interestRate: z.number(),
  compListings: z.array(z.string()),
  estimatedDelisting: z.boolean().optional(),
  delististReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Prediction = z.infer<typeof PredictionSchema>;

export interface PredictionFactors {
  interestRate: number;
  comps: Array<{
    id: string;
    price: number;
    distance: number;
    similarity: number;
  }>;
  marketTrend: number;
  seasonalAdjustment: number;
  pricePerSqft: number;
}
