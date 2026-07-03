import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

export interface AppError extends Error {
  status?: number;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${status} - ${message}`);

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    },
  });
};
