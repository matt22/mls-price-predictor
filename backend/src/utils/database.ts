import pgPromise from 'pg-promise';
import { logger } from './logger.js';

const pgp = pgPromise({
  query(e) {
    logger.debug(e.query);
  },
  error(err) {
    logger.error('Database error:', err);
  },
});

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export const db = pgp(connectionString);

// Check connection
db.connect()
  .then((obj) => {
    const result = obj.query('SELECT NOW()');
    obj.done();
    logger.info('Database connected successfully');
    return result;
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
  });
