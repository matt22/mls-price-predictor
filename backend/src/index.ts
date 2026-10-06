import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import listingsRouter from './routes/listings.js';
import predictionsRouter from './routes/predictions.js';
import { errorHandler } from './utils/errorHandler.js';
import { initializeScheduledJobs } from './services/scheduler.js';
import { openApiDocument } from './openapi/document.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API description: raw spec, plus Swagger UI for trying requests
app.get('/openapi.json', (req: Request, res: Response) => {
  res.json(openApiDocument);
});
app.get('/docs', (req: Request, res: Response) => {
  res.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MLS Price Predictor API Docs</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
<style>html{color-scheme:light}body{margin:0;background:#fff}</style>
</head><body><div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' });</script>
</body></html>`);
});

// Routes
app.use('/api/listings', listingsRouter);
app.use('/api/predictions', predictionsRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  initializeScheduledJobs();
});

export default app;
