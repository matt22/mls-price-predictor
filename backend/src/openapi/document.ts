import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from '../models/zod.js';
import { IdParamsSchema, ListingFiltersSchema, ListingSchema, ListingsPageSchema } from '../models/Listing.js';
import {
  BatchPredictionRequestSchema,
  BatchPredictionResponseSchema,
  PredictionQuerySchema,
  PredictionSchema,
} from '../models/Prediction.js';

const ErrorSchema = z
  .object({
    error: z.object({
      status: z.number().int(),
      message: z.string(),
      details: z.unknown().optional().openapi({ description: 'Only when NODE_ENV=development.' }),
    }),
  })
  .openapi('Error');

const json = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  description,
  content: { 'application/json': { schema } },
});
const badRequest = json(ErrorSchema, 'Invalid path parameter, query parameter or body.');
const notFound = json(ErrorSchema, 'No listing with that id.');

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'get',
  path: '/health',
  operationId: 'getHealth',
  summary: 'Health check',
  responses: {
    200: json(z.object({ status: z.literal('ok'), timestamp: z.string().datetime() }), 'Server is up.'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/listings',
  operationId: 'listListings',
  summary: 'List listings, newest first',
  tags: ['Listings'],
  request: { query: ListingFiltersSchema },
  responses: { 200: json(ListingsPageSchema, 'One page of listings.'), 400: badRequest },
});

registry.registerPath({
  method: 'get',
  path: '/api/listings/{id}',
  operationId: 'getListing',
  summary: 'Get one listing',
  tags: ['Listings'],
  request: { params: IdParamsSchema },
  responses: { 200: json(ListingSchema, 'The listing.'), 400: badRequest, 404: notFound },
});

registry.registerPath({
  method: 'get',
  path: '/api/predictions/listing/{id}',
  operationId: 'getPrediction',
  summary: 'Get or calculate the price prediction for a listing',
  description:
    'Returns the stored prediction if one exists, ignoring the query parameters. Otherwise calculates, stores and returns a new one.',
  tags: ['Predictions'],
  request: { params: IdParamsSchema, query: PredictionQuerySchema },
  responses: { 200: json(PredictionSchema, 'The prediction.'), 400: badRequest, 404: notFound },
});

registry.registerPath({
  method: 'post',
  path: '/api/predictions/batch',
  operationId: 'batchPredictions',
  summary: 'Calculate predictions for several listings',
  description: 'Unknown listing ids and per-listing failures are skipped, so `count` can be lower than the number of ids sent.',
  tags: ['Predictions'],
  request: { body: { content: { 'application/json': { schema: BatchPredictionRequestSchema } } } },
  responses: { 200: json(BatchPredictionResponseSchema, 'The predictions that succeeded.'), 400: badRequest },
});

export const openApiDocument = new OpenApiGeneratorV31(registry.definitions).generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'MLS Price Predictor API',
    version: '1.0.0',
    description: 'Listings synced from RentCast and rule-based price predictions.',
    license: { name: 'MIT', identifier: 'MIT' },
  },
  security: [],
  servers: [{ url: 'http://localhost:3001' }],
});
