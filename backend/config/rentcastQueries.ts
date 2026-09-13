export interface RentcastSaleQuery {
  city: string;
  state: string;
  status?: 'Active' | 'Inactive';
  daysOld?: number;
  limit?: number;
}

// Named RentCast /listings/sale query configs. Add new markets/searches
// here rather than hardcoding params into a script - each key becomes
// the output filename prefix under backend/data/rentcast/.
export const rentcastQueries: Record<string, RentcastSaleQuery> = {
  'seattle-wa-recent': {
    city: 'Seattle',
    state: 'WA',
    status: 'Active',
    daysOld: 7,
    limit: 5,
  },
};

export const DEFAULT_QUERY = 'seattle-wa-recent';
