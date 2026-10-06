import pgPromise from 'pg-promise';
import { logger } from './logger.js';

const pgp = pgPromise({
  query(e) {
    logger.debug(e.query);
  },
  // API responses and the TypeScript models use camelCase; columns stay snake_case.
  receive(e) {
    camelizeColumns(e.data);
  },
  error(err) {
    logger.error('Database error:', err);
  },
});

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// node-postgres returns NUMERIC/DECIMAL and BIGINT (e.g. COUNT(*)) as strings by
// default. Prices and rates fit comfortably in a double, so parse them as numbers.
pgp.pg.types.setTypeParser(pgp.pg.types.builtins.NUMERIC, parseFloat);
pgp.pg.types.setTypeParser(pgp.pg.types.builtins.INT8, (value: string) => parseInt(value, 10));

function camelizeColumns(data: Record<string, unknown>[]) {
  const first = data[0];
  for (const column in first) {
    const camel = pgp.utils.camelize(column);
    if (camel === column) continue;
    for (const row of data) {
      row[camel] = row[column];
      delete row[column];
    }
  }
}

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
