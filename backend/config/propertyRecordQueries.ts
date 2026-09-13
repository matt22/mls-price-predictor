export interface PropertyRecordQuery {
  zipCode: string;
  saleDateRange?: number;
  limit?: number;
}

// Named RentCast /properties query configs. Each key becomes the output
// filename prefix under backend/data/property-records/. Pair zipCode with
// saleDateRange so results are actual recent sales, not the full property
// inventory for the zip.
export const propertyRecordQueries: Record<string, PropertyRecordQuery> = {
  'seattle-98118-recent-sales': {
    zipCode: '98118',
    saleDateRange: 120,
    limit: 50,
  },
};

export const DEFAULT_QUERY = 'seattle-98118-recent-sales';
